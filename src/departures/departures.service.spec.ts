import { Test, TestingModule } from '@nestjs/testing';
import { DeparturesService } from './departures.service';
import { DbService } from 'src/db/db.service';
import { ConfigService } from '@nestjs/config';

describe('DeparturesService', () => {
  let service: DeparturesService;
  let configService: ConfigService;

  beforeAll(() => {
    configService = new ConfigService();
    configService.set('NODE_ENV', 'testing');
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbService],
      providers: [DeparturesService],
    }).compile();

    service = module.get<DeparturesService>(DeparturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
