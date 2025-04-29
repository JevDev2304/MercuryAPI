import { Injectable, ConflictException, BadRequestException, InternalServerErrorException, MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { HashService } from '../../crypt/services/hash.service';

@Injectable()
export class UserService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly hashService: HashService
  ) {}

  private async safeExecute(query: string, params: any[]) {
    try {
      return await this.databaseService.executeTransaction(query, params);
    } catch (error) {
      console.error('Database error:', error);

      if (error instanceof NotFoundException) {
        throw error;
      }
      if (typeof error === 'object' && error.code) {
        if (error.code === '23505') {
          throw new ConflictException('Already exists a user with this username or email');
        }
        if (error.code === '22007' || error.code === '22008') {
          throw new BadRequestException('Wrong Date Format');
        }
      }

      throw new InternalServerErrorException(`Internal Server Error -> ${error.message || error}`);
    }
  }

  async findUserByEmail(email: string) {
    const query = 'SELECT * FROM users WHERE users.email = $1';
    return this.safeExecute(query, [email]);
  }

  async findUserById(id: number) {
    const query = 'SELECT * FROM users WHERE users.id = $1';
    const result = await this.safeExecute(query, [id]);

    if (result?.data?.length === 1) {
      return result.data[0];
    } else if (result?.data?.length === 0) {
      throw new NotFoundException('Does not exist a user with this id');
    } else {
      throw new MethodNotAllowedException('There are more than one User with this ID');
    }
  }

  async createUser(user: CreateUserDto) {
    const hashedPassword = await this.hashService.hashPassword(user.password);
    const query = user.country
      ? 'INSERT INTO users (username, email, password, country, birth) VALUES ($1, $2, $3, $4, $5) RETURNING *'
      : 'INSERT INTO users (username, email, password, birth) VALUES ($1, $2, $3, $4) RETURNING *';

    const params = user.country
      ? [user.username, user.email, hashedPassword, user.country.toUpperCase(), user.birth]
      : [user.username, user.email, hashedPassword, user.birth];

    return this.safeExecute(query, params);
  }

  async updateUser(payload: UpdateUserDto) {
    if (payload.password) {
      payload.password = await this.hashService.hashPassword(payload.password);
    }

    const userBeforeChange = await this.findUserById(payload.id);
    if (!userBeforeChange) {
      throw new NotFoundException('User with this id does not exist');
    }

    payload.country = payload.country.toUpperCase();
    const { id, ...payloadWithoutId } = payload;
    const user = { ...userBeforeChange, ...payloadWithoutId };

    const queryUpdate = `
      UPDATE users 
      SET username = $2, 
          email = $3, 
          password = $4, 
          profile_picture = $5, 
          biography = $6, 
          country = $7, 
          birth = $8 
      WHERE id = $1
    `;

    const paramsUpdate = [
      id,
      user.username,
      user.email,
      user.password,
      user.profile_picture,
      user.biography,
      user.country,
      user.birth
    ];

    await this.safeExecute(queryUpdate, paramsUpdate);
    return { success: true, data: user };
  }
}
