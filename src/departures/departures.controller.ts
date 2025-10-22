import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { DeparturesService } from './departures.service';
import { RateLimitGuard } from 'src/rate-limit/rate-limit.guard';
import { RateLimitInterceptor } from 'src/rate-limit/rate-limit.interceptor';

@UseGuards(RateLimitGuard)
@UseInterceptors(RateLimitInterceptor)
@Controller('departures')
export class DeparturesController {
  constructor(private departuresService: DeparturesService) {}

  @Get()
  async getAllDepartures() {
    return {
      statusCode: 200,
      data: await this.departuresService.getAll(),
    };
  }
}
