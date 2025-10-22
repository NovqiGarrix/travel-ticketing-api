import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { RateLimitGuard } from 'src/rate-limit/rate-limit.guard';
import { RateLimitInterceptor } from 'src/rate-limit/rate-limit.interceptor';

@UseGuards(RateLimitGuard)
@UseInterceptors(RateLimitInterceptor)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @Get(':id')
  async getTicket(@Param('id') id: string) {
    const ticket = await this.ticketService.findById(id);

    if (!ticket) {
      return {
        statusCode: 404,
        message: `Ticket with ID: ${id} is not found`,
      };
    }

    return {
      statusCode: 200,
      data: ticket,
    };
  }
}
