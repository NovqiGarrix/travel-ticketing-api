import { Module } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { DbModule } from 'src/db/db.module';
import { TicketsModule } from 'src/tickets/tickets.module';

@Module({
  imports: [DbModule, TicketsModule],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
