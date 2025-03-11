import { strict as assert } from 'assert';
import { DatabaseService } from '../database/database.service';
import { HashService } from '../crypt/services/hash.service';
import { UserService } from '../user/services/user.service';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { UpdateUserDto } from '../user/dtos/update-user.dto';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

class UserServiceTest {
  private service: UserService;
  private databaseService: DatabaseService;
  private hashService: HashService;
  constructor() {
    // Se simula la dependencia real con un objeto "dummy"
    this.databaseService = new DatabaseService({} as any);
    this.hashService = new HashService();
    // Se asume que el constructor de UserService recibe solo DatabaseService
    this.service = new UserService(this.databaseService, this.hashService);
  }

  async runTests() {
    // ---------- CREATE USER ----------
    await this.testCreateUserWithCountry();
    await this.testCreateUserWithoutCountry();
    await this.testCreateUserConflictWithCountry();
    await this.testCreateUserBadRequestWithCountry();
    await this.testCreateUserInternalServerWithCountry();
    await this.testCreateUserConflictWithoutCountry();
    await this.testCreateUserBadRequestWithoutCountry();
    await this.testCreateUserInternalServerWithoutCountry();

    // ---------- UPDATE USER ----------
    await this.testUpdateUserWithPassword();
    await this.testUpdateUserWithoutPassword();
    await this.testUpdateUserNotFoundWithPassword();
    await this.testUpdateUserNotFoundWithoutPassword();
    await this.testUpdateUserConflictWithPassword();
    await this.testUpdateUserConflictWithoutPassword();
    await this.testUpdateUserBadRequestWithPassword();
    await this.testUpdateUserBadRequestWithoutPassword();
    await this.testUpdateUserInternalServerWithPassword();
    await this.testUpdateUserInternalServerWithoutPassword();
  }

  async testCreateUserWithCountry() {
    // Simula respuesta exitosa con country asignado
    this.databaseService.executeTransaction = async (_query, params) =>
      Promise.resolve({
        success: true,
        data: [
          {
            id: 1835767,
            username: params[0],
            email: params[1],
            password: params[2],
            profile_picture: null,
            biography: null,
            country: params[3],
            birth: params[4],
          },
        ],
      });

    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = '2004-04-23';
    user.country = 'COLOMBIA';

    const result = await this.service.createUser(user);
    assert.equal(result.data.length, 1);
    assert.equal(result.data[0].username, 'jevo123');
    assert.equal(result.data[0].email, 'juanes46@gmail.com');
    assert.equal(result.data[0].country, 'COLOMBIA');
    assert.equal(result.data[0].birth, '2004-04-23');

    console.log('✅ testCreateUserWithCountry passed');
  }

  async testCreateUserWithoutCountry() {
    // Simula respuesta exitosa; si no se envía country, se asigna "COLOMBIA" por defecto
    this.databaseService.executeTransaction = (_query, params) =>
      Promise.resolve({
        success: true,
        data: [
          {
            id: 1835767,
            username: params[0],
            email: params[1],
            password: params[2],
            profile_picture: null,
            biography: null,
            country: 'COLOMBIA', // valor por defecto
            birth: params[3],
          },
        ],
      });

    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = '2004-04-23';
    // no asigna country

    const result = await this.service.createUser(user);

    assert.equal(result.data.length, 1);
    assert.equal(result.data[0].username, 'jevo123');
    assert.equal(result.data[0].email, 'juanes46@gmail.com');
    assert.equal(result.data[0].country, 'COLOMBIA');
    assert.equal(result.data[0].birth, '2004-04-23');

    console.log('✅ testCreateUserWithoutCountry passed');
  }

  async testCreateUserConflictWithCountry() {
    // Simula error de duplicado (código 23505) para DTO con country
    this.databaseService.executeTransaction = () =>
      Promise.reject({ code: '23505' });

    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = '2004-04-23';
    user.country = 'COLOMBIA';

    try {
      await this.service.createUser(user);
      assert.fail('Expected ConflictException to be thrown');
    } catch (error) {
      assert.ok(error instanceof ConflictException);
    }

    console.log('✅ testCreateUserConflictWithCountry passed');
  }

  async testCreateUserBadRequestWithCountry() {
    // Simula error de formato de fecha (código 22007) para DTO con country
    this.databaseService.executeTransaction = () =>
      Promise.reject({ code: '22007' });

    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = 'aaaaaa';
    user.country = 'COLOMBIA';

    try {
      await this.service.createUser(user);
      assert.fail('Expected BadRequestException to be thrown');
    } catch (error) {
      assert.ok(error instanceof BadRequestException);
    }

    console.log('✅ testCreateUserBadRequestWithCountry passed');
  }

  async testCreateUserInternalServerWithCountry() {
    // Simula error desconocido para DTO con country
    this.databaseService.executeTransaction = () => Promise.reject({});

    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = 'aaaaaa';
    user.country = 'COLOMBIA';

    try {
      await this.service.createUser(user);
      assert.fail('Expected InternalServerErrorException to be thrown');
    } catch (error) {
      assert.ok(error instanceof InternalServerErrorException);
    }

    console.log('✅ testCreateUserInternalServerWithCountry passed');
  }

  async testCreateUserConflictWithoutCountry() {
    // Simula error de duplicado para DTO sin country
    this.databaseService.executeTransaction = () =>
      Promise.reject({ code: '23505' });

    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = '2004-04-23';
    // no se asigna country

    try {
      await this.service.createUser(user);
      assert.fail('Expected ConflictException to be thrown');
    } catch (error) {
      assert.ok(error instanceof ConflictException);
    }

    console.log('✅ testCreateUserConflictWithoutCountry passed');
  }

  async testCreateUserBadRequestWithoutCountry() {
    // Simula error de formato de fecha para DTO sin country
    this.databaseService.executeTransaction = () =>
      Promise.reject({ code: '22007' });

    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = 'aaaaaa';
    // no se asigna country

    try {
      await this.service.createUser(user);
      assert.fail('Expected BadRequestException to be thrown');
    } catch (error) {
      assert.ok(error instanceof BadRequestException);
    }

    console.log('✅ testCreateUserBadRequestWithoutCountry passed');
  }

  async testCreateUserInternalServerWithoutCountry() {
    // Simula error desconocido para DTO sin country
    this.databaseService.executeTransaction = () => Promise.reject({});

    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = 'aaaaaa';
    // no se asigna country

    try {
      await this.service.createUser(user);
      assert.fail('Expected InternalServerErrorException to be thrown');
    } catch (error) {
      assert.ok(error instanceof InternalServerErrorException);
    }

    console.log('✅ testCreateUserInternalServerWithoutCountry passed');
  }

  // ==================== UPDATE USER ====================
  async testUpdateUserWithPassword() {
    // Simula actualización exitosa cuando se proporciona password.
    this.databaseService.executeTransaction = (_query, params) =>
      Promise.resolve({
        success: true,
        data: [
          {
            id: params[0],
            username: params[1],
            email: params[2],
            password: params[3],
            country: params[4],
            birth: params[5],
            biography: null,
            profile_picture: null,
          },
        ],
      });

    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    user.password = 'password';
    user.country = 'COLOMBIA';
    user.birth = '2004-04-23';

    const result = await this.service.updateUser(user);

    assert.equal(result.success, true);
    assert.equal(result.data.username, 'juanes123');
    assert.equal(result.data.email, 'mail@example.com');
    assert.equal(result.data.country, 'COLOMBIA');
    assert.equal(result.data.birth, '2004-04-23');

    console.log('✅ testUpdateUserWithPassword passed');
  }

  async testUpdateUserWithoutPassword() {
    // Simula actualización exitosa sin enviar password (se conserva el existente)
    this.databaseService.executeTransaction = (_query, params) =>
      Promise.resolve({
        success: true,
        data: [
          {
            id: params[0],
            username: params[1],
            email: params[2],
            password: 'existing_hashed_password',
            country: params[4],
            birth: '2004-04-23',
            biography: null,
            profile_picture: null,
          },
        ],
      });

    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    // no se asigna password
    user.country = 'COLOMBIA';
    user.birth = '2004-04-23';

    const result = await this.service.updateUser(user);

    assert.equal(result.success, true);
    assert.equal(result.data.username, 'juanes123');
    assert.equal(result.data.email, 'mail@example.com');
    assert.equal(result.data.password, 'existing_hashed_password');
    assert.equal(result.data.country, 'COLOMBIA');
    assert.equal(result.data.birth, '2004-04-23');

    console.log('✅ testUpdateUserWithoutPassword passed');
  }

  async testUpdateUserNotFoundWithPassword() {
    // Simula que findUserById retorna null para forzar NotFoundException (con password)
    this.service.findUserById = () => Promise.resolve(null);

    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.password = '1234';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';
    user.birth = '2004-04-23';

    try {
      await this.service.updateUser(user);
      assert.fail('Expected NotFoundException to be thrown');
    } catch (error) {
      assert.ok(error instanceof NotFoundException);
    }

    console.log('✅ testUpdateUserNotFoundWithPassword passed');
  }

  async testUpdateUserNotFoundWithoutPassword() {
    // Simula que findUserById retorna null para forzar NotFoundException (sin password)
    this.service.findUserById = () => Promise.resolve(null);

    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';
    user.birth = '2004-04-23';

    try {
      await this.service.updateUser(user);
      assert.fail('Expected NotFoundException to be thrown');
    } catch (error) {
      assert.ok(error instanceof NotFoundException);
    }

    console.log('✅ testUpdateUserNotFoundWithoutPassword passed');
  }

  async testUpdateUserConflictWithPassword() {
    // Simula error de duplicado (23505) para update con password
    this.service.findUserById = () => Promise.resolve(true);
    this.databaseService.executeTransaction = () =>
      Promise.reject({ code: '23505' });

    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.password = '1234';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';
    user.birth = '2004-04-23';

    try {
      await this.service.updateUser(user);
      assert.fail('Expected ConflictException to be thrown');
    } catch (error) {
      assert.ok(error instanceof ConflictException);
    }

    console.log('✅ testUpdateUserConflictWithPassword passed');
  }

  async testUpdateUserConflictWithoutPassword() {
    // Simula error de duplicado (23505) para update sin password
    this.service.findUserById = () => Promise.resolve(true);
    this.databaseService.executeTransaction = () =>
      Promise.reject({ code: '23505' });

    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';
    user.birth = '2004-04-23';

    try {
      await this.service.updateUser(user);
      assert.fail('Expected ConflictException to be thrown');
    } catch (error) {
      assert.ok(error instanceof ConflictException);
    }

    console.log('✅ testUpdateUserConflictWithoutPassword passed');
  }

  async testUpdateUserBadRequestWithPassword() {
    // Simula error de formato de fecha (22007) para update con password
    this.service.findUserById = () => Promise.resolve(true);
    this.databaseService.executeTransaction = () =>
      Promise.reject({ code: '22007' });

    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.password = '1234';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';
    user.birth = 'aaaaa';

    try {
      await this.service.updateUser(user);
      assert.fail('Expected BadRequestException to be thrown');
    } catch (error) {
      assert.ok(error instanceof BadRequestException);
    }

    console.log('✅ testUpdateUserBadRequestWithPassword passed');
  }

  async testUpdateUserBadRequestWithoutPassword() {
    // Simula error de formato de fecha (22007) para update sin password
    this.service.findUserById = () => Promise.resolve(true);
    this.databaseService.executeTransaction = () =>
      Promise.reject({ code: '22007' });

    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';
    user.birth = 'aaaaa';

    try {
      await this.service.updateUser(user);
      assert.fail('Expected BadRequestException to be thrown');
    } catch (error) {
      assert.ok(error instanceof BadRequestException);
    }

    console.log('✅ testUpdateUserBadRequestWithoutPassword passed');
  }

  async testUpdateUserInternalServerWithPassword() {
    // Simula error desconocido para update con password
    this.service.findUserById = () => Promise.resolve(true);
    this.databaseService.executeTransaction = () => Promise.reject({});

    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.password = '1234';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';
    user.birth = '2004-04-23';

    try {
      await this.service.updateUser(user);
      assert.fail('Expected InternalServerErrorException to be thrown');
    } catch (error) {
      assert.ok(error instanceof InternalServerErrorException);
    }

    console.log('✅ testUpdateUserInternalServerWithPassword passed');
  }

  async testUpdateUserInternalServerWithoutPassword() {
    // Simula error desconocido para update sin password
    this.service.findUserById = () => Promise.resolve(true);
    this.databaseService.executeTransaction = () => Promise.reject({});

    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';
    user.birth = '2004-04-23';

    try {
      await this.service.updateUser(user);
      assert.fail('Expected InternalServerErrorException to be thrown');
    } catch (error) {
      assert.ok(error instanceof InternalServerErrorException);
    }

    console.log('✅ testUpdateUserInternalServerWithoutPassword passed');
  }
}

// Ejecutar las pruebas
const testSuite = new UserServiceTest();
testSuite.runTests();
