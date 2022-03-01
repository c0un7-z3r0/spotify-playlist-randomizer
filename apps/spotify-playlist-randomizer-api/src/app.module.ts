import { JsondbModule } from '@app/jsondb';
import { Module } from '@nestjs/common';
import { SessionModule } from './session/session.module';
import { PlaylistConfigModule } from './playlist-config/playlist-config.module';
import { RandomizerModule } from './randomizer/randomizer.module';
import { ConfigModule } from '@nestjs/config';
import { StatusController } from './status/status.controller';
import { StatusModule } from './status/status.module';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TerminusModule,
    JsondbModule,
    SessionModule,
    PlaylistConfigModule,
    RandomizerModule,
    StatusModule,
  ],
  providers: [],
  controllers: [StatusController],
})
export class AppModule {}
