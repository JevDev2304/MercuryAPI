import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DatabaseService } from 'src/database/database.service';
import { HashService } from 'src/crypt/services/hash.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../dtos/update-user.dto';

describe('UserService', () => {
  let service: UserService;
  let databaseService: DatabaseService;
  let hashService: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: DatabaseService,
          useValue: {
            executeTransaction: jest.fn().mockImplementation((query, params) => ({
              data: [
                {
                  id: 1835767,
                  username: params[0], // El username viene del parámetro de la consulta
                  email: params[1],
                  password: params[2], // Guardamos el hash generado
                  profile_picture: null,
                  biography: null,
                  country: params[3],
                  birth: params[4],
                },
              ],
            })),
          },
        },
        {
          provide: HashService,
          useValue: {
            hashPassword: jest.fn().mockResolvedValue('hashed_password_example'), // Simula el hash
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.runAllTimers();
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.resetModules();

  });

describe ('Create User', () => {
  it('It Should return the user with good structure when the DTO has country attribute ', async () => {
    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = '2004-04-23';
    user.country = 'COLOMBIA';

    const result = await service.createUser(user);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: expect.any(Number),
      username: 'jevo123',
      email: 'juanes46@gmail.com',
      password: expect.any(String), // No validamos el hash exacto
      profile_picture: null,
      biography: null,
      country: 'COLOMBIA',
      birth: '2004-04-23',
    });
  });

  it('It Should return the user with good structure when the DTO  does not have country attribute ', async () => {
    databaseService.executeTransaction = jest.fn().mockImplementation((query, params) => ({
        data: [
          {
            id: 1835767,
            username: params[0], // El username viene del parámetro de la consulta
            email: params[1],
            password: params[2], // Guardamos el hash generado
            profile_picture: null,
            biography: null,
            country: 'COLOMBIA',
            birth: params[3],
          },
        ],
      }))
    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = '2004-04-23';

    const result = await service.createUser(user);
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      id: expect.any(Number),
      username: 'jevo123',
      email: 'juanes46@gmail.com',
      password: expect.any(String), // No validamos el hash exacto
      profile_picture: null,
      biography: null,
      country: 'COLOMBIA',
      birth: '2004-04-23',
    });
  });

  it('It should throw an exception because the email or username is already in the database. (Dto has country)', async () => {
    databaseService.executeTransaction = jest.fn().mockRejectedValue({
        code: '23505'
    });
    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = '2004-04-23';
    user.country = 'COLOMBIA';

    await expect(service.createUser(user)).rejects.toThrow(ConflictException);

  });

  it('It should throw a Bad request exception because the date format is wrong (Dto has country)', async () => {
    databaseService.executeTransaction = jest.fn().mockRejectedValue({
        code: '22007'
    });
    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = 'aaaaaa';
    user.country = 'COLOMBIA';

    await expect(service.createUser(user)).rejects.toThrow(BadRequestException);

  });

  it('It should throw an Internal Server exception because is an unknown error (Dto has country)', async () => {
    databaseService.executeTransaction = jest.fn().mockRejectedValue({
    });
    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = 'aaaaaa';
    user.country = 'COLOMBIA';

    await expect(service.createUser(user)).rejects.toThrow(InternalServerErrorException);

  });

  it('It should throw an exception because the email or username is already in the database. (Dto does not have country)', async () => {
    databaseService.executeTransaction = jest.fn().mockRejectedValue({
        code: '23505'
    });
    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = '2004-04-23';

    await expect(service.createUser(user)).rejects.toThrow(ConflictException);

  });

  it('It should throw a Bad request exception because the date format is wrong (Dto does not have country)', async () => {
    databaseService.executeTransaction = jest.fn().mockRejectedValue({
        code: '22007'
    });
    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = 'aaaaaa';
    await expect(service.createUser(user)).rejects.toThrow(BadRequestException);

  });

  it('It should throw an Internal Server exception because is an unknown error (Dto does not have country)', async () => {
    databaseService.executeTransaction = jest.fn().mockRejectedValue({
    });
    const user = new CreateUserDto();
    user.username = 'jevo123';
    user.email = 'juanes46@gmail.com';
    user.password = '1234';
    user.birth = 'aaaaaa';

    await expect(service.createUser(user)).rejects.toThrow(InternalServerErrorException);

  });
});
  

  // Update user
describe('Update User', () => {

  it('It should update the information of an user (Dto has a password)', async () => {
    databaseService.executeTransaction = jest.fn().mockImplementation((query, params) => ({
      data: [
        {
          id: params[0],
          username: params[1], // El username viene del parámetro de la consulta
          email: params[2],
          password: params[3], // Guardamos el hash generado
          country: params[4],
          birth : '2004-04-23',
          biography: null,
          profile_picture: null
        },
      ],
    }))
    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    user.password ='password';
    user.country = 'COLOMBIA';

    const result = await service.updateUser(user);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      id: 1835767,
      username: 'juanes123',
      email: 'mail@example.com',
      password: expect.any(String), // No validamos el hash exacto
      profile_picture: null ,
      biography: null,
      country: 'COLOMBIA',
      birth: '2004-04-23',
    });



  });

  it('It should update the information of an user (Dto does not have a password)', async () => {
    databaseService.executeTransaction = jest.fn().mockImplementation((query, params) => ({
      data: [
        {
          id: params[0],
          username: params[1], // El username viene del parámetro de la consulta
          email: params[2],
          password: 'sadhasfka21dhbahdbah3gjdvakdf', // Guardamos el hash generado
          country: params[4],
          birth : '2004-04-23',
          biography: null,
          profile_picture: null
        },
      ],
    }))
    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';

    const result = await service.updateUser(user);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      id: 1835767,
      username: 'juanes123',
      email: 'mail@example.com',
      password: expect.any(String), // No validamos el hash exacto
      profile_picture: null ,
      biography: null,
      country: 'COLOMBIA',
      birth: '2004-04-23',
    });



  });

  it('It should throw a Not Found Exception because the database Dto user id does not exist in the database (Dto has a password)', async () => {
    service.findUserById = jest.fn().mockReturnValue(null);
    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.password = '1234'
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';

    await expect(service.updateUser(user)).rejects.toThrow(NotFoundException);



  });
  it('It should throw a Not Found Exception because the database Dto user id does not exist in the database (Dto does not have a password)', async () => {
    service.findUserById = jest.fn().mockReturnValue(null);
    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';

    await expect(service.updateUser(user)).rejects.toThrow(NotFoundException);



  });

  it('It should throw a Conflict Exception because in the database is another user with the new email (Dto has a password)', async () => {
    service.findUserById =  jest.fn().mockReturnValue(null);
    databaseService.executeTransaction= jest.fn().mockRejectedValue({
      code: '23505'
    });
    service.findUserById = jest.fn().mockReturnValue(true);
    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.password = '1234';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';

    await expect(service.updateUser(user)).rejects.toThrow(ConflictException);



  });

  it('It should throw a Conflict Exception because in the database is another user with the new email (Dto does not have a password)', async () => {
    databaseService.executeTransaction= jest.fn().mockRejectedValue({
      code:'23505'
    });
    service.findUserById = jest.fn().mockReturnValue(true);
    
    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';

    await expect(service.updateUser(user)).rejects.toThrow(ConflictException);



  });

  it('It should throw a Bad Request Exception because the new birth is wrong (Dto has a password)', async () => {
    databaseService.executeTransaction= jest.fn().mockRejectedValue({
      code:'22007'
    });
    service.findUserById = jest.fn().mockReturnValue(true);
    
    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.password = '1234';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';
    user.birth = 'aaaaa'

    await expect(service.updateUser(user)).rejects.toThrow(BadRequestException);



  });


  it('It should throw a Bad Request Exception because the new birth is wrong (Dto does not have  a password)', async () => {
    databaseService.executeTransaction= jest.fn().mockRejectedValue({
      code:'22007'
    });
    service.findUserById = jest.fn().mockReturnValue(true);
    
    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';
    user.birth = 'aaaaa'

    await expect(service.updateUser(user)).rejects.toThrow(BadRequestException);



  });

  it('It should throw an Internal Server exception because is an unknown error (Dto has password)', async () => {
    databaseService.executeTransaction= jest.fn().mockRejectedValue({
    });
    service.findUserById = jest.fn().mockReturnValue(true);
    
    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.password = '1234';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';

    await expect(service.updateUser(user)).rejects.toThrow(InternalServerErrorException);



  });


  it('It should throw an Internal Server exception because is an unknown error (Dto does not have password)', async () => {
    databaseService.executeTransaction= jest.fn().mockRejectedValue({
    });
    service.findUserById = jest.fn().mockReturnValue(true);
    
    const user = new UpdateUserDto();
    user.id = 1835767;
    user.username = 'juanes123';
    user.email = 'mail@example.com';
    user.country = 'COLOMBIA';

    await expect(service.updateUser(user)).rejects.toThrow(InternalServerErrorException);



  });
  
});




});

describe ('FindUserById', () => {});

describe('FindUserByEmail', () => {});

