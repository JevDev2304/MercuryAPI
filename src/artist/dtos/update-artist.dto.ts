import { IsString,  Length, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateArtistDto } from './create-artist.dto';

export class UpdateArtistDto extends PartialType(CreateArtistDto) {
  @ApiProperty({ required: true })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'artist image link', required: false })
  @IsString()
  @Length(255)
  @IsOptional()
  image?:string

}
