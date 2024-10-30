import { Injectable , NotFoundException, MethodNotAllowedException,InternalServerErrorException} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateSongDto } from '../dtos/create-song.dto';
import { UpdateSongDto } from '../dtos/update-song.dto';

@Injectable()
export class SongService {
    constructor(private databaseService: DatabaseService) {}

    async findSongById(id: number) {
      let query: string;
      let param: any[];
      query = 'SELECT * FROM songs WHERE id = $1'; // Simplified the query
      param = [id];
  
      try {
        const result = await this.databaseService.executeTransaction(
          query,
          param,
        );
  
        if (result.data.length === 1) {
          return result.data[0];
        } else if (result.data.length === 0) {
          throw new NotFoundException('Does not exist a song with this id'); 
        } else {
          throw new MethodNotAllowedException(
            'There are more than one song with this ID',
          ); // Known exception
        }
      } catch (error) {
        if (
          error instanceof NotFoundException ||
          error instanceof MethodNotAllowedException
        ) {
          throw error; // Rethrow the known exceptions
        } else {
          throw new InternalServerErrorException(
            'There is a Server Error -> ' + error.message,
          ); // Generic internal server error with specific message
        }
      }
    }
  
    async findSongsFromPlaylist(playlistId: number) {
      let query: string;
      let param: any[];
      query = 'SELECT song_id, genre_id,song_name, lyrics,seconds,song_image,mp3 FROM playlists_songs_view WHERE playlist_id = $1';
      param = [playlistId];
  
      try {
        const result = await this.databaseService.executeTransaction(
          query,
          param,
        );
        return result;
      } catch (error) {
        throw new InternalServerErrorException(
          'There is a Server Error -> ' + error.message,
        ); // Generic internal server error with specific message
      }
    }
  
    async createSong(song: CreateSongDto) {
      let queryCreate: string;
      let paramsCreate: any[];
      queryCreate =
        'INSERT INTO songs (name, lyrics, seconds, image, mp3, genre_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
      paramsCreate = [song.name, song.lyrics, song.seconds, song.image,song.mp3, song.genre_id];
      try {
        const result = await this.databaseService.executeTransaction(
          queryCreate,
          paramsCreate,
        );
        return result;
      } catch (error) {
        if (error === '23503') {
          throw new NotFoundException('Does not exist a genre with this ID ');}
        throw new InternalServerErrorException(
          '(Internal Server Error) -> ' + error,
        );
      }
    }

    async addSong(song_id: number, playlistId: number) {
      let queryCreate: string;
      let paramsCreate: any[];
      queryCreate =
        'INSERT INTO playlists_songs (song_id, playlist_id) VALUES ($1, $2) RETURNING *';
      paramsCreate = [song_id, playlistId];
      try {
        const result = await this.databaseService.executeTransaction(
          queryCreate,
          paramsCreate,
        );
        return result;
      } catch (error) {
        if (error === '23503') {
          throw new NotFoundException('Does not exist a song or playlist with these IDs ');}
        throw new InternalServerErrorException(
          '(Internal Server Error) -> ' + error,
        );
      }
    }
    async deleteSongFromPlaylist(song_id: number, playlistId: number) {
      const queryDelete = 'DELETE FROM playlists_songs WHERE song_id = $1 AND playlist_id = $2 RETURNING *';
      const paramsDelete = [song_id, playlistId];
    
      try {
        const result = await this.databaseService.executeTransaction(queryDelete, paramsDelete);
        
        // Verificamos si result tiene datos para determinar si se eliminó algo
        if (result.data[0].length === 0) { // Suponiendo que result es un array
          throw new NotFoundException('The song or playlist does not exist with the given IDs');
        }
    
        return result;
      } catch (error) {
        if (
          error instanceof NotFoundException ||
          error instanceof MethodNotAllowedException
        ) {
          throw error; // Rethrow the known exceptions
        } else {
          throw new InternalServerErrorException(
            'There is a Server Error -> ' + error.message,
          ); // Generic internal server error with specific message
        }
      }
    }
    
    async updateSong(payload: UpdateSongDto) {
      const songBeforeChange = await this.findSongById(payload.id);
      if (!songBeforeChange) {
        throw new NotFoundException('Song with this id does not exist');
      }
      const { id, ...payloadWithoutId } = payload;
  
      // Combina los datos anteriores del usuario con los nuevos del payload
      const song = { ...songBeforeChange, ...payloadWithoutId };
  
      // Define la consulta SQL para actualizar el usuario
      const queryUpdate = `
              UPDATE songs 
              SET genre_id = $2, 
                  name = $3, 
                  lyrics = $4, 
                  created_at = $5,
                  seconds = $6,
                  image = $7,
                  mp3 = $8
              WHERE id = $1
          `;
  
      // Define los parámetros de la consulta en el orden correspondiente
      const paramsUpdate = [
        id,
        song.genre_id,
        song.name,
        song.lyrics,
        song.created_at,
        song.seconds,
        song.image, 
        song.mp3
      ];
  
      // Ejecuta la consulta con los parámetros
      try {
        await this.databaseService.executeTransaction(queryUpdate, paramsUpdate);
      } catch (error) {
        if (error === '23503') {
        throw new NotFoundException('Does not exist a genre with this ID ');}
        throw new InternalServerErrorException(
          '(Internal Server Error) -> ' + error,
        );
      }
  
      return { success: true, data: song };
    }
}
