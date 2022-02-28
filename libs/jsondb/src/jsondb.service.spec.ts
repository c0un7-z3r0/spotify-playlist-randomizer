import { Test, TestingModule } from '@nestjs/testing';
import { JsondbService } from './jsondb.service';

describe('JsondbService', () => {
  let service: JsondbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsondbService],
    }).compile();

    service = module.get<JsondbService>(JsondbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
