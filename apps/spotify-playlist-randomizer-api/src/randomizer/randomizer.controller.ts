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

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

@Controller('randomizer')
export class RandomizerController {
  constructor(
    private readonly randomizerService: RandomizerService,
    private readonly spotifyService: SpotifyService,
    private readonly jsondbService: JsondbService,
  ) {}

  private getRandomAlbum(
    albums: SpotifyApi.AlbumObjectSimplified[],
    prevAlbumIds: string[],
  ): SpotifyApi.AlbumObjectSimplified {
    const unknownAlbums = albums.filter(
      (album) => !prevAlbumIds.includes(album.id),
    );
    unknownAlbums.forEach((a) => console.log(a.name));

    if (unknownAlbums.length <= 0) {
      return null;
    }
    const randomAlbumIndex = randomIntFromInterval(0, unknownAlbums.length);
    return unknownAlbums[randomAlbumIndex];
  }

  private updatePrevAlbumIds(id: string, playlistConfig: PlaylistConfig) {
    if (!playlistConfig.currentAlbumId) {
      return playlistConfig.prevAlbumIds ?? [];
    }
    const prevAlbumIds = [
      ...(playlistConfig.prevAlbumIds ?? []),
      playlistConfig.currentAlbumId,
    ];
    this.jsondbService.updateById<Partial<PlaylistConfig>, PlaylistConfig>(
      DB_KEY,
      id,
      {
        prevAlbumIds,
      },
    );
    return prevAlbumIds;
  }

  private async randomize(id: string) {
    const playlistConfig = this.jsondbService.getById<PlaylistConfig>(
      DB_KEY,
      id,
    );

    if (!playlistConfig) {
      return new NotFoundException('Playlist Config not found');
    }

    const prevAlbumIds = this.updatePrevAlbumIds(id, playlistConfig);

    const albums = await this.spotifyService.getAllAlbumsOfArtist(
      playlistConfig.artistId,
    );
    const randomAlbum = this.getRandomAlbum(albums, prevAlbumIds);
    if (!randomAlbum) {
      return new ImATeapotException('No random album could be found');
    }

    const trackIds = await this.spotifyService.getAllTrackIdsOfAlbum(
      randomAlbum.id,
    );
    this.spotifyService.replaceTracksInPlaylist(id, trackIds);
    this.jsondbService.updateById<Partial<PlaylistConfig>, PlaylistConfig>(
      DB_KEY,
      id,
      {
        currentAlbumId: randomAlbum.id,
      },
    );
    return {
      msg: `Playlist (${playlistConfig.playlistId}) has been updated with ${randomAlbum.name}`,
    };
  }

  @Get('/randomizePlaylist/:id')
  async randomizePlaylist(@Param('id') id: string) {
    return this.randomize(id);
  }

  @Get('/randomizeAllPlaylist')
  randomizeAllPlaylists() {
    const playlistConfigs = this.jsondbService.getAll<PlaylistConfig>(DB_KEY);
    const result = Promise.all(
      Object.values(playlistConfigs).map(({ playlistId }) => {
        return this.randomize(playlistId);
      }),
    );
    return result;
  }
}
