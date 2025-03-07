import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { DatabaseService } from 'src/database/database.service';
import { HashService } from 'src/crypt/services/hash.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';

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
    hashService = module.get<HashService>(HashService);
  });

  it('Should return the user with good structure when the DTO has country attribute ', async () => {
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

  it('Should return the user with good structure when the DTO  does not has country attribute ', async () => {
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

  it('It should throw an exception because the email or username is already in the database.', async () => {
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

  it('It should throw a Bad request exception because the date format is wrong', async () => {
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

  it('It should throw an Internal Server exception because is an unknown error', async () => {
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


 
});
