import { PartialType } from '@nestjs/swagger';
import { CreatePlaylistConfigDto } from './create-playlist-config.dto';

export class UpdatePlaylistConfigDto extends PartialType(CreatePlaylistConfigDto) {}
