import { Test, TestingModule } from '@nestjs/testing';
import { RandomizerService } from './randomizer.service';

describe('RandomizerService', () => {
  let service: RandomizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomizerService],
    }).compile();

    service = module.get<RandomizerService>(RandomizerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
