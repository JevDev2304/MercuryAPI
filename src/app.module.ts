import { ConfigModule} from '@nestjs/config';

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MusicModule } from './music/music.module';
import { ArtistModule } from './artist/artist.module';
import { MessageModule } from './message/message.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CryptModule } from './crypt/crypt.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    MusicModule,
    ArtistModule,
    MessageModule,
    DatabaseModule,
    AuthModule,
    CryptModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
