import { Controller, Get, HttpStatus, Query, UsePipes } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import {
  getSchedulesParamsDto,
  type GetSchedulesParamsDto,
} from './dto/params.dto.schedule';
import { ValidationPipe } from 'src/validation/validation.pipe';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  @UsePipes(new ValidationPipe(getSchedulesParamsDto))
  async getSchedules(@Query() params: GetSchedulesParamsDto) {
    return {
      statusCode: HttpStatus.OK,
      data: await this.schedulesService.getSchedules(params),
    };
  }
}
