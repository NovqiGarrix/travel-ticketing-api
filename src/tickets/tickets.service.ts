import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { and, eq } from 'drizzle-orm';
import { DbService, schema } from 'src/db/db.service';
import { RedisService } from 'src/redis/redis.service';
import { SeatUpdatesMessageEvent } from 'src/types';
import { CreateTicketDto } from './dto/request.body.dto.ticket';

@Injectable()
export class TicketsService {
  constructor(
    private readonly dbService: DbService,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // In seconds
  private readonly SEAT_LOCKED_DURATION = 10;

  findById(id: string) {
    return this.dbService.db.query.ticket.findFirst({
      where: eq(schema.ticket.id, id),
    });
  }

  private getLockedSeatsKey(scheduleId: string, seatIdentifier: string) {
    return `locked-seats_${scheduleId}:${seatIdentifier}`;
  }

  private getLockedSeatsPrefixKey(scheduleId: string) {
    return `locked-seats_${scheduleId}:`;
  }

  // Return seat identifiers
  private async getLockedSeatValues(lockedSeatKeys: string[]) {
    return await Promise.all(
      lockedSeatKeys.map(async (key) => (await this.redisService.db.get(key))!),
    );
  }

  async getLockedSeats(scheduleId: string) {
    const [occupiedSeats, [, lockedSeatKeys]] = await Promise.all([
      this.dbService.db.query.seat.findMany({
        where: and(eq(schema.seat.scheduleId, scheduleId)),
      }),

      // Using SCAN instead of KEYS
      // because SCAN is
      this.redisService.db.scan(
        // Start from 0
        0,
        'MATCH',
        `${this.getLockedSeatsPrefixKey(scheduleId)}*`,
        'COUNT',
        // Why 15? Because every schedule has maximum 15 seats
        15,
      ),
    ]);

    const lockedSeats = await this.getLockedSeatValues(lockedSeatKeys);
    return occupiedSeats.map((seat) => seat.seatIdentifier).concat(lockedSeats);
  }

  async create(data: CreateTicketDto) {
    // Check if schedule exists
    const schedule = await this.dbService.db.query.schedule.findFirst({
      where: eq(schema.schedule.id, data.scheduleId),
      columns: {
        id: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: `Schedule with ID: ${data.scheduleId} does not exist`,
      });
    }

    // Check whether the seat is available
    const seat = await this.dbService.db.query.seat.findFirst({
      where: and(
        eq(schema.seat.seatIdentifier, data.seatIdentifier),
        eq(schema.seat.scheduleId, data.scheduleId),
      ),
      columns: {
        id: true,
        seatIdentifier: true,
      },
    });

    if (seat) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        error: `Seat '${seat.seatIdentifier}' is occupied`,
      });
    }

    // If it is not occupied,
    // check if it locked
    const isSeatLocked = Boolean(
      await this.redisService.db.exists(
        this.getLockedSeatsKey(data.scheduleId, data.seatIdentifier),
      ),
    );

    if (isSeatLocked) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        error: `Sorry seat '${data.seatIdentifier}' is locked`,
      });
    }

    const newTicket = await this.dbService.db.transaction(async (tx) => {
      const [[newTicket]] = await Promise.all([
        // Add new ticket
        tx.insert(schema.ticket).values([data]).returning(),

        // Lock seat in Redis
        this.redisService.db.setex(
          this.getLockedSeatsKey(data.scheduleId, data.seatIdentifier),
          this.SEAT_LOCKED_DURATION,
          data.seatIdentifier,
        ),
      ]);

      return newTicket;
    });

    // Send seat updates event
    const seatsUpdateMessageEvent: SeatUpdatesMessageEvent = {
      // event type for the client
      data: {
        event: 'seat-locked',
        data: [data.seatIdentifier],
      },
    };

    this.eventEmitter.emit(
      // event type for the server
      `locked-seats-update:${data.scheduleId}`,
      seatsUpdateMessageEvent,
    );

    return {
      ticket: newTicket,
      secondsBeforeInvalid: this.SEAT_LOCKED_DURATION,
    };
  }
}
