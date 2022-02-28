import { JsondbModule } from '@app/jsondb';
import { NconfModule } from '@app/nconf';
import { SpotifyModule } from '@app/spotify';
import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [SpotifyModule, NconfModule, JsondbModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
