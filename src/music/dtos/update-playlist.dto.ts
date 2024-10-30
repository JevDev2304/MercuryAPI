import { IsNumber } from 'class-validator';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreatePlaylistDto } from './create-playlist.dto';

export class UpdatePlaylistDto extends OmitType(PartialType(CreatePlaylistDto),['userId'] as const) {
  @ApiProperty({ required: true })
  @IsNumber()
  id: number;
}