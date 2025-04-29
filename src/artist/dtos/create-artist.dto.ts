import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateArtistDto {
  @ApiProperty()
  @Length(45)
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @Length(45)
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @ApiProperty()
  @Length(255)
  @IsString()
  @IsNotEmpty()
  password: string;
  @ApiProperty({description:'Optional (DEFAULT -> COLOMBIA)'})
  @Length(45)
  @IsString()
  country?: string;
}
