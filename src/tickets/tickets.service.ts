import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbService, schema } from 'src/db/db.service';

@Injectable()
export class TicketsService {
  constructor(private readonly dbService: DbService) {}

  findById(id: string) {
    return this.dbService.db.query.ticket.findFirst({
      where: eq(schema.ticket.id, id),
    });
  }
}
