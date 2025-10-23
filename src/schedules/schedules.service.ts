import { Injectable } from '@nestjs/common';
import { and, count, eq, getTableColumns, gte, lt, sql } from 'drizzle-orm';
import { DbService, schema } from 'src/db/db.service';
import { GetSchedulesParamsDto } from './dto/params.dto.schedule';

@Injectable()
export class SchedulesService {
  constructor(private readonly dbService: DbService) {}

  getSchedules(params: GetSchedulesParamsDto) {
    const { isAvailable: _, ...scheduleColumns } = getTableColumns(
      schema.schedule,
    );

    return this.dbService.db
      .select({
        ...scheduleColumns,
        totalLockedSeat: count(schema.seat),
        departure: {
          id: schema.departure.id,
          departure: schema.departure.label,
        },
        destination: {
          id: schema.destination.id,
          destinaation: schema.destination.label,
        },
      })
      .from(schema.schedule)
      .fullJoin(
        schema.departure,
        eq(schema.departure.id, schema.schedule.departureId),
      )
      .fullJoin(
        schema.destination,
        eq(schema.destination.id, schema.schedule.destinationId),
      )
      .leftJoin(schema.seat, eq(schema.seat.scheduleId, schema.schedule.id))
      .where(
        and(
          // time is the column name
          // and ::timestamp is kind of function
          // to convert the time into timestamp (YYYY-MM-DD HH:mm:ss)
          gte(sql`time::timestamp`, sql`${params.departureDate}::timestamp`),
          eq(schema.schedule.departureId, params.departureId),
          eq(schema.schedule.destinationId, params.destinationId),
          eq(schema.schedule.isAvailable, true),
        ),
      )
      .groupBy(schema.schedule.id, schema.departure.id, schema.destination.id)
      .having(lt(count(schema.seat), 15));
  }
}
