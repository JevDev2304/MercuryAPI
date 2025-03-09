import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from 'src/database/database.service';
import { UserService } from 'src/user/services/user.service';
import { ArtistService } from 'src/artist/services/artist.service';
import { HashService } from 'src/crypt/services/hash.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let databaseService: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: {
            executeTransaction: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: UserService,
          useValue: {
            findUserByEmail: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: ArtistService,
          useValue: {
            findArtistByEmail: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: HashService,
          useValue: {
            validatePassword: jest.fn().mockResolvedValue(false),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockedAccessToken'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

describe('Login', () => {
    it('C22 It should return a JSON with { access_token: <token> } (artist)', async () => {
        const user = { id: 5, email: 'juanes@example.com', role: 'artist' };
        const result = await authService.login(user, '127.0.0.1');
    
        expect(result).toEqual({ access_token: 'mockedAccessToken' });
      });
    
      it('C23 It should return a JSON with { access_token: <token> } (user)', async () => {
        const user = { id: 5, email: 'juanes@example.com', role: 'user' };
        const result = await authService.login(user, '127.0.0.1');
    
        expect(result).toEqual({ access_token: 'mockedAccessToken' });
      });
    
      it('C24 It should return a BadRequestException (400) due the role is invalid', async () => {
        const user = { id: 5, email: 'juanes@example.com', role: 'cs50duck' };
        await expect(authService.login(user, '127.0.0.1')).rejects.toThrow(BadRequestException);
      });
    
      it('C25 It should return an InternalServerErrorException (500) due the database is not working well (artist)', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue(new Error('Database Error'));
    
        const user = { id: 5, email: 'juanes@example.com', role: 'artist' };
        await expect(authService.login(user, '127.0.0.1')).rejects.toThrow(InternalServerErrorException);
      });
    
      it('C26 It should return an InternalServerErrorException (500) due the database is not working well (user)', async () => {
        databaseService.executeTransaction = jest.fn().mockRejectedValue(new Error('Database Error'));
    
        const user = { id: 5, email: 'juanes@example.com', role: 'user' };
        await expect(authService.login(user, '127.0.0.1')).rejects.toThrow(InternalServerErrorException);
      });
    });
    
})
  