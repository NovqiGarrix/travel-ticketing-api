import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ValidationPipe } from 'src/validation/validation.pipe';
import {
  type CreatePaymentSessionDto,
  createPaymentSessionDto,
  xenditPaymentSessionWebhook,
  type XenditPaymentSessionWebhook,
} from './dto/request.body.payments.dto';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { Env } from 'src/env';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe(createPaymentSessionDto))
  async createPaymentSession(@Body() data: CreatePaymentSessionDto) {
    return {
      statusCode: HttpStatus.CREATED,
      data: await this.paymentsService.createPaymentSession(data.ticketId),
    };
  }

  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe(xenditPaymentSessionWebhook))
  async handleXenditPaymentSessionWebhook(
    @Headers('X-CALLBACK-TOKEN') xenditWebhookToken: string,
    @Body() data: XenditPaymentSessionWebhook,
  ) {
    // Verify if the request is coming from Xendit
    if (
      this.configService.get('XENDIT_WEBHOOK_TOKEN_VERIFICATION') !==
      xenditWebhookToken
    ) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Invalid Webhook',
      };
    }

    await this.paymentsService.handleXenditPaymentWebhook(data);

    return {
      statusCode: HttpStatus.OK,
    };
  }
}
