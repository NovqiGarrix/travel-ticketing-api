import { Controller, Get, HttpStatus } from '@nestjs/common';
import { DestinationsService } from './destinations.service';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  async getDestinations() {
    return {
      statusCode: HttpStatus.OK,
      data: await this.destinationsService.getDestinations(),
    };
  }
}
