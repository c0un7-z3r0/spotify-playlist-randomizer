import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Spotify Client ID',
    example: 'test-clientid',
    type: String,
  })
  clientId: string;
  @ApiProperty({
    description: 'Spotify Client Secret',
    example: 'test-clientsecret',
    type: String,
  })
  clientSecret: string;
}
