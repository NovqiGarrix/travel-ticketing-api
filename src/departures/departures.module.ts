import { Module } from '@nestjs/common';
import { DeparturesService } from './departures.service';
import { DeparturesController } from './departures.controller';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  providers: [DeparturesService],
  controllers: [DeparturesController],
})
export class DeparturesModule {}
