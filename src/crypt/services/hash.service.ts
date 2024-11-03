import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';


@Injectable()
export class HashService {
  private readonly saltRounds = parseInt(process.env.SALT_ROUNDS,10); // Rondas de sal para el cifrado

  // Método para validar la cadena
  private validateString(password: string): boolean {
    return typeof password === 'string' && password.length > 0;
  }

  // Método para cifrar la contraseña
  async hashPassword(password: string): Promise<string> {
    if (!this.validateString(password)) {
      throw new BadRequestException('The password cannot be empty');
    }

    // Hasheamos la contraseña con la semilla
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password + process.env.HASH_SECRET, salt);
  }

  // Método para verificar la contraseña ingresada contra el hash almacenado
  async validatePassword(enteredPassword: string, storedHash: string): Promise<boolean> {
    if (!this.validateString(enteredPassword) || !this.validateString(storedHash)) {
      return false
    }

    // Comparamos la contraseña ingresada con el hash almacenado
    return await bcrypt.compare(enteredPassword + process.env.HASH_SECRET, storedHash);
  }
}
