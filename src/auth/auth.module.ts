import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ArtistService } from 'src/artist/services/artist.service';
import { ArtistModule } from 'src/artist/artist.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
    imports:[UserModule,
        ArtistModule,
        DatabaseModule,
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports:[ConfigModule],
            inject:[ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions:{
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN')
                }
            })
        })
    ],
    providers:[AuthService,JwtStrategy, LocalStrategy],
    exports: [AuthService],
    controllers: [AuthController]
})
export class AuthModule {}
