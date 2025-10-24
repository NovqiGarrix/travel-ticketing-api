import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import { DbService, schema } from 'src/db/db.service';
import { Env } from 'src/env';
import type { XenditPaymentSessionWebhook } from 'src/payments/dto/request.body.payments.dto';
import { RedisService } from 'src/redis/redis.service';
import { CreateTicketDto } from 'src/tickets/dto/request.body.dto.ticket';
import { TicketsService } from 'src/tickets/tickets.service';
import { v7 } from 'uuid';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dbService: DbService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  private readonly logger = new Logger(PaymentsService.name);

  private readonly XENDIT_API_URL = 'https://api.xendit.co';

  async createPaymentSession(ticketId: string) {
    const ticket = await this.dbService.db.query.ticket.findFirst({
      where: eq(schema.ticket.id, ticketId),
      with: {
        schedule: {
          columns: {
            id: true,
            price: true,
          },
          with: {
            departure: {
              columns: {
                label: true,
              },
            },
            destination: {
              columns: {
                label: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: `Ticket with ID: ${ticketId} does not exist`,
      });
    }

    const orderer = ticket.orderer as CreateTicketDto['orderer'];

    // Initiate payment to Xendit
    // Read here: https://docs.xendit.co/apidocs/create-session
    const paymentPayload = {
      reference_id: ticket.id,
      session_type: 'PAY',
      mode: 'PAYMENT_LINK',
      amount: ticket.totalPassenger * ticket.schedule.price,
      currency: 'IDR',
      country: 'ID',
      customer: {
        reference_id: v7(),
        type: 'INDIVIDUAL',
        email: orderer.email,
        mobile_number: orderer.noWa,
        individual_detail: {
          given_names: orderer.name,
        },
      },
      items: [
        {
          reference_id: ticket.schedule.id,
          name: `${ticket.totalPassenger} ticket(s)`,
          description: `Ticket to ${ticket.schedule.destination.label}`,
          type: 'PHYSICAL_SERVICE',
          category: 'TICKET',
          net_unit_amount: ticket.schedule.price,
          quantity: ticket.totalPassenger,
          currency: 'IDR',
        },
      ],
      capture_method: 'AUTOMATIC',
      locale: 'id',
      success_return_url: `${this.configService.get('CLIENT_URL')}/tickets/${ticket.id}/success`,
      cancel_return_url: `${this.configService.get('CLIENT_URL')}/tickets/${ticket.id}/cancel`,
    };

    const authentication = Buffer.from(
      `${this.configService.get('XENDIT_SECRET_KEY')}:`,
    ).toString('base64');

    const paymentResp = await fetch(`${this.XENDIT_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authentication}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload),
    });

    // Check the Xendit doc for more info
    const dataOrError = (await paymentResp.json()) as {
      payment_link_url: string;
      payment_session_id: string;
    }; // There are more than this. We can validate this with Zod, but I'm pretty sure their service has validated it

    if (paymentResp.status !== 201) {
      this.logger.error(`Failed to create payment session: `, dataOrError);
      throw new InternalServerErrorException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: `An error occur on our end when setting up your payment. Please try again later.`,
      });
    }

    // Create payment data on our own
    await this.dbService.db.insert(schema.payment).values([
      {
        paymentSessionId: dataOrError.payment_session_id,
        amount: paymentPayload.amount,
        ticketId: paymentPayload.reference_id,
      },
    ]);

    return dataOrError;
  }

  async handleXenditPaymentWebhook(data: XenditPaymentSessionWebhook) {
    if (data.event === 'payment_session.expired') {
      this.logger.error(
        `Webhook - payment_session_id: ${data.data.payment_session_id} --> Payment session expired!`,
      );

      await this.dbService.db
        .update(schema.payment)
        .set({
          paymentStatus: 'EXPIRED',
          error: 'Your payment is expired. You can create a new one',
        })
        .where(
          eq(schema.payment.paymentSessionId, data.data.payment_session_id),
        );

      // if it expired
      // the locked seat will be unlocked
      // then the client has to check, if that seat is still available
      // if so, the client can re-initiate the payment again using the ticketId
      // if it is expired, the client has to redirect the user back to the seats page
      // to choose another seat, then call PATCH /tickets/{ticketId} to update the seat info
      // then make a call again to initiate a new payment

      return;
    }

    const ticket = await this.dbService.db.query.ticket.findFirst({
      where: eq(schema.ticket.id, data.data.reference_id),
      columns: {
        id: true,
        seatIdentifier: true,
      },
      with: {
        schedule: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (!ticket) {
      this.logger.error(
        `Webhook - payment_session_id: ${data.data.id} --> Ticket not found: ${data.data.reference_id}`,
      );
      await this.dbService.db
        .update(schema.payment)
        .set({
          paymentStatus: 'ERROR',
          error: 'Ticket not found',
        })
        .where(
          eq(schema.payment.paymentSessionId, data.data.payment_session_id),
        );
      return;
    }

    // if it is succeeded:

    await this.dbService.db.transaction(async (tx) => {
      // update payment info
      await tx
        .update(schema.payment)
        .set({
          paymentStatus: 'PAID',
        })
        .where(
          eq(schema.payment.paymentSessionId, data.data.payment_session_id),
        );

      // add new occupied seat in the database
      await tx.insert(schema.seat).values([
        {
          scheduleId: ticket.schedule.id,
          seatIdentifier: ticket.seatIdentifier,
        },
      ]);

      // and remove locked seat from Redis
      await this.redisService.db.del(
        TicketsService.getLockedSeatsKey(
          ticket.schedule.id,
          ticket.seatIdentifier,
        ),
      );
    });

    this.logger.log(
      `Payment succeeded --> payment_session_id: ${data.data.payment_session_id} and ticket_id: ${data.data.reference_id}`,
    );
  }
}
