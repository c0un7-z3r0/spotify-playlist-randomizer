import { Module } from '@nestjs/common';
import { RandomizerService } from './randomizer.service';
import { RandomizerController } from './randomizer.controller';
import { JsondbModule } from '@app/jsondb';
import { SpotifyModule } from '@app/spotify';

@Module({
  imports: [JsondbModule, SpotifyModule],
  controllers: [RandomizerController],
  providers: [RandomizerService],
})
export class RandomizerModule {}
