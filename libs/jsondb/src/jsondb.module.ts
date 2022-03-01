import { Module } from '@nestjs/common';
import { JsondbService } from './jsondb.service';
import { ConfigModule } from '@nestjs/config';
import { JsonDbHealthIndicator } from './jsondb.health';
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [JsondbService, JsonDbHealthIndicator],
  exports: [JsondbService, JsonDbHealthIndicator],
})
export class JsondbModule {}
