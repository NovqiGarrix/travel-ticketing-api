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
import { fromEvent, map, Observable } from 'rxjs';
import { ValidationPipe } from 'src/validation/validation.pipe';
import {
  type GetLockedSeatsParamsDto,
  getLockedSeatsParamsDto,
  getSchedulesParamsDto,
  type GetSchedulesParamsDto,
} from './dto/params.dto.schedule';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
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
  getLockedSeatsSSE(
    @Param() params: GetLockedSeatsParamsDto,
  ): Observable<MessageEvent> {
    return fromEvent(
      this.eventEmitter,
      `locked-seats-update:${params.scheduleId}`,
    ).pipe(
      map(
        (data: string[]) =>
          ({ data, event: 'seats-update' }) as any as MessageEvent,
      ),
    );
  }
}
