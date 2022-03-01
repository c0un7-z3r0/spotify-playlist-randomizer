import { JsondbService } from '@app/jsondb';
import { SpotifyService } from '@app/spotify';
import { Injectable, Scope, Body, Logger } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { CreateSessionDto } from './dto/create-session.dto';

export const DB_KEY = 'sessions';
export const DEFAULT_ID = 'userSession';
export interface UserSessionDbEntry {
  id: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  refreshToken?: string;
}

@Injectable({ scope: Scope.DEFAULT })
export class SessionService {
  spotifyApi: SpotifyWebApi;
  userData: UserSessionDbEntry;
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly jsondbService: JsondbService,

  ) {
    try {
      const userSession = this.jsondbService.getById<UserSessionDbEntry>(
        DB_KEY,
        DEFAULT_ID,
      );
      if (userSession) {
        this.spotifyService.init(userSession);
      }
    } catch (err) {
      this.logger.warn('Could not find default user. Please add user via api.');
    }
  }

  async generateAccessAndRefreshToken(authCode: string) {
    const tokens = await this.spotifyService.generateTokens(authCode);
    this.spotifyService.updateAccessAndRefreshToken(tokens);
    const { id } = this.getUserData();
    this.jsondbService.updateById(DB_KEY, id, {
      ...this.userData,
      ...tokens,
    });
  }

  private generateOauthUrl() {
    return this.spotifyService.getOauthUrl([
      'playlist-modify-private',
      'playlist-read-private',
    ]);
  }

  private getUserData(): UserSessionDbEntry {
    const userSession = this.jsondbService.getById<UserSessionDbEntry>(
      DB_KEY,
      DEFAULT_ID,
    );
    this.logger.log(userSession);
    return userSession;
  }

  async getOauthUrl() {
    if (this.spotifyService.isInitialised) {
      const { clientId, clientSecret } = this.getUserData();

      this.spotifyService.init({
        clientId,
        clientSecret,
      });
    }
    return this.generateOauthUrl();
  }

  createUserSession({ clientId, clientSecret }: CreateSessionDto) {
    this.spotifyService.init({ clientId, clientSecret });

    this.jsondbService.add<UserSessionDbEntry>(DB_KEY, {
      id: DEFAULT_ID,
      clientId,
      clientSecret,
    });

    return this.generateOauthUrl();
  }
}
