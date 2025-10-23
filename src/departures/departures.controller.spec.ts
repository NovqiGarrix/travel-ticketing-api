import { Test, TestingModule } from '@nestjs/testing';
import { DeparturesController } from './departures.controller';
import { DbService } from 'src/db/db.service';

describe('DeparturesController', () => {
  let controller: DeparturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbService],
      controllers: [DeparturesController],
    }).compile();

    controller = module.get<DeparturesController>(DeparturesController);
  });

  it('should return approriate code and empty data', async () => {
    const resp = await controller.getAllDepartures();
    expect(resp).toEqual({
      statusCode: 200,
      data: [],
    });
  });
});
