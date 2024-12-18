import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ArtistController } from './controllers/artist/artist.controller';
import { ArtistService } from './services/artist.service';
import { CryptModule } from 'src/crypt/crypt.module';

@Module({
  imports: [DatabaseModule,CryptModule],
  providers: [ArtistService],
  controllers: [ArtistController],
  exports: [ArtistService]
})
export class ArtistModule {}
