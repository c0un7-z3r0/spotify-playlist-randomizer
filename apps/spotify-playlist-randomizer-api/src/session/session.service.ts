import { JsondbService } from '@app/jsondb';
import { SpotifyService } from '@app/spotify';
import { Injectable, Scope, Body, Logger } from '@nestjs/common';
import SpotifyWebApi from 'spotify-web-api-node';
import { CreateSessionDto } from './dto/create-session.dto';

const DB_KEY = 'sessions';
const DEFAULT_ID = 'userSession';
interface UserSessionDbEntry {
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
    const { userSession } =
      this.jsondbService.getAll<UserSessionDbEntry>(DB_KEY);
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

  createUserSession({
    clientId,
    clientSecret,
    userId = DEFAULT_ID,
  }: CreateSessionDto) {
    this.spotifyService.init({ clientId, clientSecret });

    this.jsondbService.add<UserSessionDbEntry>(DB_KEY, {
      id: userId,
      clientId,
      clientSecret,
    });

    return this.generateOauthUrl();
  }
}