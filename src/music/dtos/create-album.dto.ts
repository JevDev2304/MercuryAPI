import { IsString, IsNotEmpty, Length, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAlbumDto {
  @ApiProperty({ required: true })
  @IsNumber()
  @IsNotEmpty()
  genre_id: number;
  @ApiProperty({ required: true })
  @Length(45)
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;
  @ApiProperty({description:'image link'})
  @Length(255)
  @IsString()
  @IsNotEmpty()
  image: string;
}
