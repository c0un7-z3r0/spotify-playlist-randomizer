import { Module } from '@nestjs/common';
import { JsondbService } from './jsondb.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [JsondbService],
  exports: [JsondbService],
})
export class JsondbModule {}
