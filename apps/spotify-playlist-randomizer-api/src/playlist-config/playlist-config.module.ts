import { JsondbModule } from '@app/jsondb';
import { Module } from '@nestjs/common';
import { PlaylistConfigService } from './playlist-config.service';
import { PlaylistConfigController } from './playlist-config.controller';
import { SpotifyModule } from '@app/spotify';

@Module({
  imports: [JsondbModule, SpotifyModule],
  controllers: [PlaylistConfigController],
  providers: [PlaylistConfigService],
})
export class PlaylistConfigModule {}
