import { JsondbModule } from '@app/jsondb';
import { Module } from '@nestjs/common';
import { SessionModule } from './session/session.module';
import { PlaylistConfigModule } from './playlist-config/playlist-config.module';
import { RandomizerModule } from './randomizer/randomizer.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JsondbModule,
    SessionModule,
    PlaylistConfigModule,
    RandomizerModule,
  ],
  providers: [],
})
export class AppModule {}
