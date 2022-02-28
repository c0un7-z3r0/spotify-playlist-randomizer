import { Body, Controller, Get, Post, Query, Redirect } from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionService } from './session.service';

@ApiTags('User Session')
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('/callback')
  @ApiOperation({
    summary: 'OAuth callback endpoint',
    description:
      'Is the callback url that spotify oauth process will redirect. This will then generate the access and refresh token',
  })
  oauthCallback(@Query('code') authCode: string) {
    this.sessionService.generateAccessAndRefreshToken(authCode);
    return 'OK';
  }

  @Get('/getOauthUrl')
  @ApiOperation({
    summary: 'Get user oauth url',
    description: '... TODO ...',
  })
  getOauthUrl() {
    return { url: this.sessionService.getOauthUrl() };
  }

  @Post()
  @ApiOperation({
    summary: 'Create a users session',
    description:
      'Creates the users session and redirects to the spotify oauth screen',
  })
  createSession(@Body() createSessionDto: CreateSessionDto) {
    return {
      url: this.sessionService.createUserSession({ ...createSessionDto }),
    };
  }
}
