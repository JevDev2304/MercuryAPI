import { IsString, IsInt, IsEmail } from 'class-validator';

export class LoginUserDto {
  @IsInt()
  id: number;

  @IsEmail()
  email: string;

  @IsString()
  role: string;

  [key: string]: any; // Permite propiedades adicionales sin validarlas
}
