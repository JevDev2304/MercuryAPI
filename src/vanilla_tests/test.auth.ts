import { strict as assert } from 'assert';
import { AuthService } from '../auth/services/auth.service';
import { DatabaseService } from '../database/database.service';
import { UserService } from '../user/services/user.service';
import { ArtistService } from '../artist/services/artist.service';
import { HashService } from '../crypt/services/hash.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

class AuthServiceTest {
  private authService: AuthService;
  private databaseService: DatabaseService;
  private jwtService: JwtService;

  constructor() {
    this.databaseService = new DatabaseService({} as any);
    this.jwtService = new JwtService({} as any);

    const hashService = new HashService();
    const userService = new UserService({} as any, {} as any);
    const artistService = new ArtistService({} as any, {} as any);

    // Instanciamos el servicio de autenticación con los mocks
    this.authService = new AuthService(
      this.databaseService,
      userService,
      artistService,
      hashService,
      this.jwtService
    );

    // Mockeamos la base de datos para devolver el formato correcto
    this.databaseService.executeTransaction = async (_query: string, _params: any[]) => {
      return Promise.resolve({ success: true, data: [] });
    };

    // Mockeamos el servicio JWT para devolver un token fijo
    this.jwtService.sign = (_payload: any) => 'mockedAccessToken';
  }

  async runTests() {
    await this.testLoginAsArtist();
    await this.testLoginAsUser();
    await this.testInvalidRole();
    await this.testDatabaseErrorArtist();
    await this.testDatabaseErrorUser();
  }

  async testLoginAsArtist() {
    const user = { id: 5, email: 'juanes@example.com', role: 'artist' };
    const result = await this.authService.login(user, '127.0.0.1');

    assert.deepEqual(result, { access_token: 'mockedAccessToken' });
    console.log('✅ testLoginAsArtist passed');
  }

  async testLoginAsUser() {
    const user = { id: 5, email: 'juanes@example.com', role: 'user' };
    const result = await this.authService.login(user, '127.0.0.1');

    assert.deepEqual(result, { access_token: 'mockedAccessToken' });
    console.log('✅ testLoginAsUser passed');
  }

  async testInvalidRole() {
    const user = { id: 5, email: 'juanes@example.com', role: 'cs50duck' };
    try {
      await this.authService.login(user, '127.0.0.1');
      assert.fail('Expected BadRequestException to be thrown');
    } catch (error) {
      assert.ok(error instanceof BadRequestException);
    }
    console.log('✅ testInvalidRole passed');
  }

  async testDatabaseErrorArtist() {
    this.databaseService.executeTransaction = () => Promise.reject(new Error('Database Error'));
    const user = { id: 5, email: 'juanes@example.com', role: 'artist' };
    try {
      await this.authService.login(user, '127.0.0.1');
      assert.fail('Expected InternalServerErrorException to be thrown');
    } catch (error) {
      assert.ok(error instanceof InternalServerErrorException);
    }
    console.log('✅ testDatabaseErrorArtist passed');
  }

  async testDatabaseErrorUser() {
    this.databaseService.executeTransaction = () => Promise.reject(new Error('Database Error'));
    const user = { id: 5, email: 'juanes@example.com', role: 'user' };
    try {
      await this.authService.login(user, '127.0.0.1');
      assert.fail('Expected InternalServerErrorException to be thrown');
    } catch (error) {
      assert.ok(error instanceof InternalServerErrorException);
    }
    console.log('✅ testDatabaseErrorUser passed');
  }
}

// Ejecutar las pruebas
const testSuite = new AuthServiceTest();
testSuite.runTests();
