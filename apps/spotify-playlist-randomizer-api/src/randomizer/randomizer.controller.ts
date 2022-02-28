import { JsondbService } from '@app/jsondb';
import { SpotifyService } from '@app/spotify';
import {
  Controller,
  Get,
  ImATeapotException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { UpdatePlaylistConfigDto } from '../playlist-config/dto/update-playlist-config.dto';
import { PlaylistConfig } from '../playlist-config/entities/playlist-config.entity';
import { DB_KEY, Playlists } from '../playlist-config/playlist-config.service';
import { RandomizerService } from './randomizer.service';

@Controller('randomizer')
export class RandomizerController {
  constructor(
    private readonly randomizerService: RandomizerService,
    private readonly jsondbService: JsondbService,
  ) {}

  @Get('/randomizePlaylist/:id')
  async randomizePlaylist(@Param('id') id: string) {
    return this.randomizerService.randomize(id);
  }

  @Get('/randomizeAllPlaylist')
  randomizeAllPlaylists() {
    const playlistConfigs = this.jsondbService.getAll<PlaylistConfig>(DB_KEY);
    const result = Promise.all(
      Object.values(playlistConfigs).map(({ id }) => {
        return this.randomizerService.randomize(id);
      }),
    );
    return result;
  }
}
