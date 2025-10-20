import { Controller, Get, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';

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
