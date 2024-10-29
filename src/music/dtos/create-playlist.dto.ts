import { IsString, IsNotEmpty, Length, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaylistDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;
  @ApiProperty()
  @Length(45)
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @Length(255)
  @IsBoolean()
  @IsNotEmpty()
  isPublic: boolean;
}
