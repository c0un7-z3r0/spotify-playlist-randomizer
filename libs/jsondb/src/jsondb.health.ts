
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import fs from "fs"

@Injectable()
export class JsonDbHealthIndicator extends HealthIndicator {

    constructor(private readonly configService: ConfigService) {
        super()
    }

    async isHealthy(key= "jsondb"): Promise<HealthIndicatorResult> {
        try {
            const path = `${this.configService.get<string>('DB_PATH') ?? 'data'}/db.json`
            const isHealthy = fs.statSync(path).isFile()
            return this.getStatus(key, isHealthy, { path });
        } catch (err) {
            const result = this.getStatus(key, false, { error: err });
            throw new HealthCheckError('JsonDB check failed', result);
        }
    }
}

