import { JsondbService } from '@app/jsondb';
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { DB_KEY, DEFAULT_ID, UserSessionDbEntry } from './session.service';

@Injectable()
export class SessionHealthIndicator extends HealthIndicator {

    constructor(
        private readonly jsondbService: JsondbService,
    ) {
        super()
    }

    async isHealthy(): Promise<HealthIndicatorResult> {
            const userSession = this.jsondbService.getById<UserSessionDbEntry>(
                DB_KEY,
                DEFAULT_ID,
            );
            const clientIdExists = !!userSession.clientId
            const clientSecretExists = !!userSession.clientSecret
            const accessTokenExists = !!userSession.accessToken
            const refreshTokenExists = !!userSession.refreshToken
            const isHealthy = clientIdExists && clientSecretExists
            const result =  this.getStatus('session', isHealthy, { clientIdExists, clientSecretExists, accessTokenExists, refreshTokenExists });
            if(isHealthy){
                return result
            }
            throw new HealthCheckError('Session Config corrupt', result);
    }
}

