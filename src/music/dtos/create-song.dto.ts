import { IsString, IsNotEmpty, Length, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSongDto {
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
  lyrics: string;
  @ApiProperty()
  @IsString()
  time: string;
  @ApiProperty({description:'image link'})
  @Length(255)
  @IsString()
  @IsNotEmpty()
  image: string;
  @ApiProperty({description:'mp3 link'})
  @Length(255)
  @IsString()
  @IsNotEmpty()
  mp3: string;
}
