import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaylistConfigDto {
  @ApiProperty({
    description: 'The name of the playlist that should be created/used.',
    example: 'test-playlist',
    type: String,
  })
  playlistName: string;
  @ApiProperty({
    description:
      'The artist id that should be used to generate the random playlist. (Spotify ID)',
    example: '1lhceMHrxr0jC943AuAhhh',
    type: String,
  })
  artistId: string;
}
