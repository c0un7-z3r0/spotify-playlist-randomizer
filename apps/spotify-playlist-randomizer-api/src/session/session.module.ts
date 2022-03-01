import { JsondbModule } from '@app/jsondb';
import { SpotifyModule } from '@app/spotify';
import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { SessionHealthIndicator } from './session.health';

@Module({
  imports: [SpotifyModule, JsondbModule],
  controllers: [SessionController],
  providers: [SessionService, SessionHealthIndicator],
  exports: [SessionHealthIndicator]
})
export class SessionModule {}
