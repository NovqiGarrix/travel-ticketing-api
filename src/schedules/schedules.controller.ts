import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
  Sse,
  UsePipes,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { defer, from, fromEvent, map, merge } from 'rxjs';
import { ValidationPipe } from 'src/validation/validation.pipe';
import {
  type GetLockedSeatsParamsDto,
  getLockedSeatsParamsDto,
  getSchedulesParamsDto,
  type GetSchedulesParamsDto,
} from './dto/params.dto.schedule';
import { SchedulesService } from './schedules.service';
import { TicketsService } from 'src/tickets/tickets.service';

@Controller('schedules')
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly ticketsService: TicketsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe(getSchedulesParamsDto))
  async getSchedules(@Query() params: GetSchedulesParamsDto) {
    return {
      statusCode: HttpStatus.OK,
      data: await this.schedulesService.getSchedules(params),
    };
  }

  @Sse('/:scheduleId/locked-seats')
  @UsePipes(new ValidationPipe(getLockedSeatsParamsDto))
  async getLockedSeatsSSE(@Param() params: GetLockedSeatsParamsDto) {
    const initialLockedSeats = await this.ticketsService.getLockedSeats(
      params.scheduleId,
    );
    const initialEvent$ = defer(() =>
      from([{ data: { event: 'locked-seats', data: initialLockedSeats } }]),
    );

    const updatesEvent$ = fromEvent(
      this.eventEmitter,
      `locked-seats-update:${params.scheduleId}`,
    ).pipe(map((data) => data as MessageEvent));

    return merge(initialEvent$, updatesEvent$);
  }
}
