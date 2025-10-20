import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class DeparturesService {
  constructor(private dbService: DbService) {}

  getAll() {
    return this.dbService.db.query.departure.findMany();
  }
}
