import { Controller, Get } from '@nestjs/common';
import { DeparturesService } from './departures.service';

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
