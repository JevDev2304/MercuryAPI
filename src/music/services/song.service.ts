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


    async findSongsByGenreId(id: number) {
      let query: string;
      let param: any[];
      query = 'SELECT * FROM songs WHERE genre_id = $1'; // Simplified the query
      param = [id];
  
      try {
        const result = await this.databaseService.executeTransaction(
          query,
          param,
        );
  
        if (result.data.length >= 0) {
          return result.data;
        }
      } catch (error) {
        
          throw new InternalServerErrorException(
            'There is a Server Error -> ' + error.message,
          ); // Generic internal server error with specific message
        
      }
    }

    async findSongsforSearchEngine(word: string) {
      let query: string;
      let param: any[];
      query = 'SELECT * FROM songs WHERE LOWER(name) LIKE $1;'; // Simplified the query
      word = word.toLowerCase();
      const wordFormatted = `%${word}%`; 
      param = [wordFormatted];
  
      try {
        const result = await this.databaseService.executeTransaction(
          query,
          param,
        );
  
        if (result.data.length >= 0) {
          return result.data;
        }
      } catch (error) {
        
          throw new InternalServerErrorException(
            'There is a Server Error -> ' + error.message,
          ); // Generic internal server error with specific message
        
      }
    }

    async getRandomSongs(n: number) {
      let query: string;
      let param: any[];
      query = 'SELECT * FROM songs ORDER BY RANDOM() LIMIT $1';
      param = [n];
  
      try {
        const result = await this.databaseService.executeTransaction(
          query,
          param,
        );
  
        if (result.data.length >= 0) {
          return result.data;
        }
      } catch (error) {
        
          throw new InternalServerErrorException(
            'There is a Server Error -> ' + error.message,
          ); // Generic internal server error with specific message
        
      }
    }

    async deleteSong(id: number) {
      // Verifica si el álbum existe antes de intentar eliminarlo
      const song = await this.findSongById(id);
      if (!song) {
        throw new NotFoundException('Song with this id does not exist');
      }
    
      // Define la consulta SQL para eliminar el álbum
      const queryDelete = `
        DELETE FROM songs
        WHERE id = $1
        RETURNING *;  -- Esta cláusula devuelve los registros eliminados
      `;
    
      // Define los parámetros de la consulta
      const paramsDelete = [id];
    
      // Ejecuta la consulta con los parámetros
      let deletedSong;
      try {
        // Aquí asumimos que executeTransaction soporta RETURNING
        deletedSong = await this.databaseService.executeTransaction(queryDelete, paramsDelete);
      } catch (error) {
        throw new InternalServerErrorException(
          '(Internal Server Error) -> ' + error,
        );
      }
    
      return { success: true, data: deletedSong }; // Devuelve el álbum eliminado
    }
    async findSongsFromPlaylist(playlistId: number) {
      let query: string;
      let param: any[];
      query = 'SELECT song_id, genre_id,song_name, lyrics,time,song_image,mp3 FROM playlists_songs_view WHERE playlist_id = $1';
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
    async findSongsFromAlbum(albumId: number){
      let query: string;
      let param: any[];
      query = 'SELECT song_id, genre_id,song_name, lyrics,time,song_image,mp3 FROM albums_songs_view WHERE album_id = $1';
      param = [albumId];
  
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
    async top20Songs(){
      let query: string;
      let param: any[];
      query = 'SELECT * FROM songs_replays ORDER BY play_count DESC LIMIT 20;';
  
      try {
        const result = await this.databaseService.executeTransaction(
          query
        );
        return result;
      } catch (error) {
        throw new InternalServerErrorException(
          'There is a Server Error -> ' + error.message,
        ); // Generic internal server error with specific message
      }
      
    }

    async findSongsFromArtist(artistId: number){
      let query: string;
      let param: any[];
      query = 'SELECT song_id, genre_id,song_name, lyrics,time,song_image,mp3 FROM artists_songs_view WHERE artist_id = $1';
      param = [artistId];
  
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
        'INSERT INTO songs (name, lyrics, time, image, mp3, genre_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
      paramsCreate = [song.name, song.lyrics, song.time, song.image,song.mp3, song.genre_id];
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

    async addSongToPlaylist(song_id: number, playlistId: number) {
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

    async replaySong(song_id: number) {
      let queryCreate: string;
      let paramsCreate: any[];
      queryCreate =
        'INSERT INTO replays (song_id) VALUES ($1) RETURNING *';
      paramsCreate = [song_id];
      try {
        const result = await this.databaseService.executeTransaction(
          queryCreate,
          paramsCreate,
        );
        return result;
      } catch (error) {
        console.error(error);
        if (error === '23503' || error.code === '23503') {
          throw new NotFoundException('Does not exist a song  with this ID ');}
        throw new InternalServerErrorException(
          '(Internal Server Error) -> ' + error,
        );
      }
    }

    async addSongToArtist(song_id: number, artistId: number) {
      let queryCreate: string;
      let paramsCreate: any[];
      queryCreate =
        'INSERT INTO artists_songs (song_id, artist_id) VALUES ($1, $2) RETURNING *';
      paramsCreate = [song_id, artistId];
      try {
        const result = await this.databaseService.executeTransaction(
          queryCreate,
          paramsCreate,
        );
        return result;
      } catch (error) {
        if (error === '23503') {
          throw new NotFoundException('Does not exist a song or artist with these IDs ');}
        throw new InternalServerErrorException(
          '(Internal Server Error) -> ' + error,
        );
      }
    }

    async deleteSongFromArtist(song_id: number, artistId: number) {
      const queryDelete = 'DELETE FROM artists_songs WHERE song_id = $1 AND artist_id = $2 RETURNING *';
      const paramsDelete = [song_id, artistId];
    
      try {
        const result = await this.databaseService.executeTransaction(queryDelete, paramsDelete);
        
        // Verificamos si result tiene datos para determinar si se eliminó algo
        if (result.data[0].length === 0) { // Suponiendo que result es un array
          throw new NotFoundException('The song or artist does not exist with the given IDs');
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


    async addSongToAlbum(song_id: number, albumId: number) {
      let queryCreate: string;
      let paramsCreate: any[];
      queryCreate =
        'INSERT INTO albums_songs (song_id, album_id) VALUES ($1, $2) RETURNING *';
      paramsCreate = [song_id, albumId];
      try {
        const result = await this.databaseService.executeTransaction(
          queryCreate,
          paramsCreate,
        );
        return result;
      } catch (error) {
        if (error === '23503') {
          throw new NotFoundException('Does not exist a song or album with these IDs ');}
        throw new InternalServerErrorException(
          '(Internal Server Error) -> ' + error,
        );
      }
    }



    async deleteSongFromAlbum(song_id: number, albumId: number) {
      const queryDelete = 'DELETE FROM albums_songs WHERE song_id = $1 AND album_id = $2 RETURNING *';
      const paramsDelete = [song_id, albumId];
    
      try {
        const result = await this.databaseService.executeTransaction(queryDelete, paramsDelete);
        
        // Verificamos si result tiene datos para determinar si se eliminó algo
        if (result.data[0].length === 0) { // Suponiendo que result es un array
          throw new NotFoundException('The song or album does not exist with the given IDs');
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
                  time = $6,
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
        song.time,
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
