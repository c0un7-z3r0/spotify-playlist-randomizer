import { Injectable, Logger, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SpotifyWebApi from 'spotify-web-api-node';

const REQUEST_LIMIT = 50;
const MAX_UPDATE_TRACKS_PER_REQUEST = 100;

interface AlbumTracks {
  tracks: SpotifyApi.TrackObjectSimplified[];
  total: number;
}
interface ArtistAlbums {
  albums: SpotifyApi.AlbumObjectSimplified[];
  total: number;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface SpotifyServiceConfig {
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
}

function logExceptions<T extends any[], U>(
  func: (...args: T) => PromiseLike<U>,
): (...args: T) => Promise<U> {
  return async (...args) => {
    try {
      return await func(...args);
    } catch (err) {
      console.log(func.name + ' caused an error');
      throw err;
    }
  };
}

@Injectable()
export class SpotifyService {
  private api: SpotifyWebApi;
  private initialised = false;
  private readonly logger = new Logger(SpotifyService.name);

  constructor(private configService: ConfigService) {}

  init({
    clientId,
    clientSecret,
    accessToken,
    refreshToken,
  }: SpotifyServiceConfig) {
    const redirectUri = `${this.configService.get<string>(
      'BASE_PATH',
    )}/session/callback`;
    this.logger.log(`Using redirectUri ${redirectUri}`);
    this.api = new SpotifyWebApi({
      redirectUri: `${this.configService.get<string>(
        'BASE_PATH',
      )}/session/callback`,
      clientId,
      clientSecret,
      accessToken,
      refreshToken,
    });
    this.initialised = true;
    return this.api;
  }

  isInitialised() {
    return this.initialised;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setAuthAndRefreshTokens() {}

  getOauthUrl(scopes: string[]) {
    return this.api.createAuthorizeURL(scopes, '');
  }

  private getArtistAlbum = async (
    artistId: string,
    offset = 0,
    limit = REQUEST_LIMIT,
  ): Promise<ArtistAlbums> => {
    try {
      const albums = await this.api.getArtistAlbums(artistId, {
        limit,
        offset,
        include_groups: 'album',
      });
      return {
        albums: albums.body.items,
        total: albums.body.total,
      };
    } catch (err: any) {
      if (err.statusCode === 401) {
        await this.handle401();
        return this.getArtistAlbum(artistId, offset, limit);
      }
    }
  };

  private getAlbumTracks = async (
    albumId: string,
    offset = 0,
    limit = REQUEST_LIMIT,
  ): Promise<AlbumTracks> => {
    try {
      const tracksResponse = await this.api.getAlbumTracks(albumId, {
        limit,
        offset,
      });
      return {
        tracks: tracksResponse.body.items,
        total: tracksResponse.body.total,
      };
    } catch (err: any) {
      if (err.statusCode === 401) {
        await this.handle401();
        return this.getAlbumTracks(albumId, offset, limit);
      }
    }
  };

  getAllTracksOfAlbum = async (
    albumId: string,
    offset = 0,
    limit = REQUEST_LIMIT,
    tracks: SpotifyApi.TrackObjectSimplified[] = [],
  ): Promise<SpotifyApi.TrackObjectSimplified[]> => {
    const response = await this.getAlbumTracks(albumId, offset, limit);
    const merged = [...tracks, ...response.tracks];
    if (merged.length < response.total) {
      process.stdout.write('.');
      const newOffset = merged.length;
      const newLimit = Math.min(response.total - merged.length, REQUEST_LIMIT);
      return this.getAllTracksOfAlbum(albumId, newOffset, newLimit, merged);
    }
    console.log(` - ✅ Done (${merged.length}/${response.total} Tracks)`);
    return merged;
  };

  private getTrackIds = (
    tracksOfAlbum: SpotifyApi.TrackObjectSimplified[],
  ): string[] => tracksOfAlbum.map((item) => item.uri);

  getAllTrackIdsOfAlbum = async (albumId: string) => {
    return this.getTrackIds(await this.getAllTracksOfAlbum(albumId));
  };

  private handle401 = async () => {
    console.info('♻️ Refreshing tokens.');

    this.updateAccessAndRefreshToken(await this.refreshTokens());
  };

  getAllAlbumsOfArtist = async (
    artistId: string,
    offset = 0,
    limit = REQUEST_LIMIT,
    albums: SpotifyApi.AlbumObjectSimplified[] = [],
  ): Promise<SpotifyApi.AlbumObjectSimplified[]> => {
    const response = await this.getArtistAlbum(artistId, offset, limit);
    const merged = [...albums, ...response.albums];

    if (merged.length < response.total) {
      process.stdout.write('.');
      const newOffset = merged.length;
      const newLimit = Math.min(response.total - merged.length, REQUEST_LIMIT);
      return this.getAllAlbumsOfArtist(artistId, newOffset, newLimit, merged);
    }
    console.log(` - ✅ Done (${merged.length}/${response.total} Albums)`);
    return merged;
  };

  private createPlaylist = async (playlistName: string) => {
    try {
      console.log(
        `⚠️ Playlist "${playlistName}" did not exist for user. Will create a new playlist.`,
      );
      const createUserPlaylistResponse = await this.api.createPlaylist(
        playlistName,
        {
          description: 'generated playlist',
          public: false,
        },
      );
      return createUserPlaylistResponse.body;
    } catch (err: any) {
      if (err.statusCode === 401) {
        await this.handle401();
        return this.createPlaylist(playlistName);
      }
    }
  };

  private getUserPlaylistByName = async (playlistName: string) => {
    try {
      const userPlaylistResponse = await this.api.getUserPlaylists();
      return userPlaylistResponse.body.items.find(
        (pl) => pl.name === playlistName,
      );
    } catch (err: any) {
      if (err.statusCode === 401) {
        await this.handle401();
        return this.getUserPlaylistByName(playlistName);
      }
    }
  };

  getOrCreateUserPlaylistByName = async (playlistName: string) => {
    const playlist = await this.getUserPlaylistByName(playlistName);
    if (playlist) return playlist;

    return this.createPlaylist(playlistName);
  };

  replaceTracksInPlaylist = async (playlistId: string, trackIds: string[]) => {
    try {
      if (trackIds.length > MAX_UPDATE_TRACKS_PER_REQUEST) {
        const chunks = trackIds.reduce((collection, item, index) => {
          const chunkIndex = Math.floor(index / MAX_UPDATE_TRACKS_PER_REQUEST);
          if (!collection[chunkIndex]) {
            collection[chunkIndex] = [];
          }
          collection[chunkIndex].push(item);
          return collection;
        }, [] as string[][]);
        for (const index in chunks) {
          if (index === '0') {
            await this.api.replaceTracksInPlaylist(playlistId, chunks[index]);
          } else {
            await this.api.addTracksToPlaylist(playlistId, chunks[index]);
          }
        }
      } else {
        await this.api.replaceTracksInPlaylist(playlistId, trackIds);
      }
    } catch (err: any) {
      if (err.statusCode === 401) {
        await this.handle401();
        return this.replaceTracksInPlaylist(playlistId, trackIds);
      }
    }
  };

  refreshTokens = async () => {
    try {
      console.log('refreshing tokens');
      const grant = await this.api.refreshAccessToken();

      return {
        accessToken: grant.body['access_token'],
        refreshToken: grant.body['refresh_token'],
      };
    } catch (err: any) {
      console.debug('🔎', err.message);
      throw new Error(
        '🔴 Failed to refresh access token. Please generate new tokens`',
      );
    }
  };

  updateAccessAndRefreshToken = async ({
    accessToken,
    refreshToken,
  }: TokenResponse) => {
    this.api.setAccessToken(accessToken);
    this.api.setRefreshToken(refreshToken);
  };

  generateTokens = async (code: string): Promise<TokenResponse> => {
    const grant = await this.api.authorizationCodeGrant(code);
    return {
      accessToken: grant.body['access_token'],
      refreshToken: grant.body['refresh_token'],
    };
  };
}
