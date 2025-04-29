import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @Length(45)
  @IsString()
  @IsNotEmpty()
  username: string;
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
  @ApiProperty({description:'YYYY-MM-DD'})
  @Length(10)
  @IsString()
  @IsNotEmpty()
  birth: string;
  @ApiProperty({description:'Optional (DEFAULT -> COLOMBIA)'})
  @Length(45)
  @IsString()
  country?: string;
}
