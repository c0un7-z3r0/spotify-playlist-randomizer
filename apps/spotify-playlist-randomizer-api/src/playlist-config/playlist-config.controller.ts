import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlaylistConfigService, Playlists } from './playlist-config.service';
import { CreatePlaylistConfigDto } from './dto/create-playlist-config.dto';
import { UpdatePlaylistConfigDto } from './dto/update-playlist-config.dto';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('Playlist Config')
@Controller('playlist-config')
export class PlaylistConfigController {
  constructor(private readonly playlistConfigService: PlaylistConfigService) {}

  @Post()
  @ApiProperty({
    description: 'as',
  })
  async create(@Body() createPlaylistConfigDto: CreatePlaylistConfigDto) {
    return this.playlistConfigService.create({
      ...createPlaylistConfigDto,
    });
  }

  @Get()
  findAll(): Playlists {
    return this.playlistConfigService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistConfigService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlaylistConfigDto: UpdatePlaylistConfigDto,
  ) {
    return this.playlistConfigService.update(id, updatePlaylistConfigDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistConfigService.remove(id);
  }
}
