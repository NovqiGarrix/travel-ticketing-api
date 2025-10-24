import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class DestinationsService {
  constructor(private readonly dbService: DbService) {}

  getDestinations() {
    return this.dbService.db.query.destination.findMany();
  }
}
