import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { ArtistController } from './controllers/artist/artist.controller';
import { ArtistService } from './services/artist.service';

@Module({
  imports: [DatabaseModule],
  providers: [ArtistService],
  controllers: [ArtistController],
  exports: [ArtistService]
})
export class ArtistModule {}
