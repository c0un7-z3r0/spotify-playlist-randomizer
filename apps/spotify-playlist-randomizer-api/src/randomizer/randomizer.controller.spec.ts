import { Test, TestingModule } from '@nestjs/testing';
import { RandomizerController } from './randomizer.controller';
import { RandomizerService } from './randomizer.service';

describe('RandomizerController', () => {
  let controller: RandomizerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RandomizerController],
      providers: [RandomizerService],
    }).compile();

    controller = module.get<RandomizerController>(RandomizerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
