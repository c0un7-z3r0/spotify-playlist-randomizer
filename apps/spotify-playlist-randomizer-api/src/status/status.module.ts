import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { JsondbModule } from '@app/jsondb';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [SessionModule, TerminusModule, HttpModule, JsondbModule],
  controllers: [StatusController],
})
export class StatusModule {}
