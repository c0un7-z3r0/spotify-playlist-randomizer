import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistConfigService } from './playlist-config.service';

describe('PlaylistConfigService', () => {
  let service: PlaylistConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaylistConfigService],
    }).compile();

    service = module.get<PlaylistConfigService>(PlaylistConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
