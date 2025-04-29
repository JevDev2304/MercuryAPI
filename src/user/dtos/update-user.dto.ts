import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ required: true })
  @IsNumber()
  id: number;


  @ApiProperty({ description: 'Biography text', required: false })
  @IsString()
  @IsOptional()
  biography?:string

  @ApiProperty({ description: 'profile image link', required: false })
  @IsString()
  @IsOptional()
  profile_picture?:string
}
