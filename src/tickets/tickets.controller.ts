import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { RateLimitGuard } from 'src/rate-limit/rate-limit.guard';
import { RateLimitInterceptor } from 'src/rate-limit/rate-limit.interceptor';
import {
  type CreateTicketDto,
  createTicketDto,
} from './dto/request.body.dto.ticket';
import { ValidationPipe } from 'src/validation/validation.pipe';

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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe(createTicketDto))
  async createTicket(@Body() data: CreateTicketDto) {
    return {
      statusCode: HttpStatus.CREATED,
      data: await this.ticketService.create(data),
    };
  }
}
