import { Module } from '@nestjs/common';
import { PlaylistService } from './services/playlist.service';
import { SongService } from './services/song.service';
import { GenreService } from './services/genre.service';
import { AlbumService } from './services/album.service';
import { DatabaseModule } from 'src/database/database.module';
import { PlaylistController } from './controllers/playlist/playlist.controller';
import { SongController } from './controllers/song/song.controller';

@Module({
  imports: [DatabaseModule],
  providers: [PlaylistService, SongService, GenreService, AlbumService],
  controllers: [PlaylistController, SongController]
})
export class MusicModule {}
