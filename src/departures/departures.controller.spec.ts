import { Test, TestingModule } from '@nestjs/testing';
import { DeparturesController } from './departures.controller';

describe('DeparturesController', () => {
  let controller: DeparturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeparturesController],
    }).compile();

    controller = module.get<DeparturesController>(DeparturesController);
  });

  it('should return approriate code and empty data', async () => {
    const resp = await controller.getAllDepartures();
    expect(resp).toEqual({
      code: 200,
      data: [],
    });
  });
});
