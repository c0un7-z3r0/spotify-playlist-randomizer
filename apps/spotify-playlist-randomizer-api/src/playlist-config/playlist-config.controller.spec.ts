import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistConfigController } from './playlist-config.controller';
import { PlaylistConfigService } from './playlist-config.service';

describe('PlaylistConfigController', () => {
  let controller: PlaylistConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistConfigController],
      providers: [PlaylistConfigService],
    }).compile();

    controller = module.get<PlaylistConfigController>(PlaylistConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
