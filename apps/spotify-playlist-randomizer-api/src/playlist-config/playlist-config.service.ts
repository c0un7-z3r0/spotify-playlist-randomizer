import { JsondbService } from '@app/jsondb';
import { SpotifyService } from '@app/spotify';
import { Injectable } from '@nestjs/common';
import { CreatePlaylistConfigDto } from './dto/create-playlist-config.dto';
import { UpdatePlaylistConfigDto } from './dto/update-playlist-config.dto';
import { PlaylistConfig } from './entities/playlist-config.entity';

export const DB_KEY = 'playlists';

export type Playlists = { [id: string]: PlaylistConfig };

export interface CreatePlaylistConfigRecord extends CreatePlaylistConfigDto {
  id: string;
}

@Injectable()
export class PlaylistConfigService {
  constructor(
    private readonly jsondbService: JsondbService,
    private readonly spotifyService: SpotifyService,
  ) {}
  async create(
    createPlaylistConfigRecord: Omit<CreatePlaylistConfigRecord, 'id'>,
  ) {
    const playlist = await this.spotifyService.getOrCreateUserPlaylistByName(
      createPlaylistConfigRecord.playlistName,
    );
    this.jsondbService.add(DB_KEY, {
      ...createPlaylistConfigRecord,
      id: playlist.id,
    });
  }

  findAll(): Playlists {
    return this.jsondbService.getAll<PlaylistConfig>(DB_KEY);
  }

  findOne(id: string): PlaylistConfig {
    return this.jsondbService.getById<PlaylistConfig>(DB_KEY, id);
  }

  update(id: string, updatePlaylistDto: UpdatePlaylistConfigDto) {
    this.jsondbService.updateById<UpdatePlaylistConfigDto, PlaylistConfig>(
      DB_KEY,
      id,
      updatePlaylistDto,
    );
  }

  remove(id: string): void {
    this.jsondbService.deleteById(DB_KEY, id);
  }
}
