import { Injectable, NotFoundException, MethodNotAllowedException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateAlbumDto } from '../dtos/create-album.dto';
import { UpdateAlbumDto } from '../dtos/update-album.dto';

@Injectable()
export class AlbumService {

    constructor(private databaseService: DatabaseService) {}
   
    async findArtistAlbums(artistId: number){
      let query: string;
      let param: any[];
      query = 'SELECT album_id, album_name, genre_id, album_description, album_creation_date, album_image FROM artists_albums_view WHERE artist_id = $1';
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

    async findAlbumsByGenreId(id: number) {
      let query: string;
      let param: any[];
      query = 'SELECT * FROM albums WHERE genre_id = $1'; // Simplified the query
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

    async findAlbumsforSearchEngine(word: string) {
      let query: string;
      let param: any[];
      query = 'SELECT * FROM albums WHERE LOWER(name) LIKE $1;'; // Simplified the query
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

    async findAlbumById(id: number) {
      let query: string;
      let param: any[];
      query = 'SELECT * FROM albums WHERE id = $1'; // Simplified the query
      param = [id];
  
      try {
        const result = await this.databaseService.executeTransaction(
          query,
          param,
        );
  
        if (result.data.length === 1) {
          return result.data[0];
        } else if (result.data.length === 0) {
          throw new NotFoundException('Does not exist an album with this id'); 
        } else {
          throw new MethodNotAllowedException(
            'There are more than one album with this ID',
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
    async createAlbum(album: CreateAlbumDto) {
      let queryCreate: string;
      let paramsCreate: any[];
      queryCreate =
        'INSERT INTO albums (name, description, genre_id, image) VALUES ($1, $2, $3, $4) RETURNING *';
      paramsCreate = [album.name, album.description, album.genre_id, album.image];
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
    
    async updateAlbum(payload: UpdateAlbumDto) {
      const albumBeforeChange = await this.findAlbumById(payload.id);
      if (!albumBeforeChange) {
        throw new NotFoundException('Album with this id does not exist');
      }
      const { id, ...payloadWithoutId } = payload;
  
      // Combina los datos anteriores del usuario con los nuevos del payload
      const album = { ...albumBeforeChange, ...payloadWithoutId };
  
      // Define la consulta SQL para actualizar el usuario
      const queryUpdate = `
              UPDATE albums 
              SET genre_id = $2, 
                  name = $3, 
                  description = $4, 
                  created_at = $5,
                  image = $6
              WHERE id = $1
          `;
  
      // Define los parámetros de la consulta en el orden correspondiente
      const paramsUpdate = [
        id,
        album.genre_id,
        album.name,
        album.description,
        album.created_at,
        album.image
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
  
      return { success: true, data: album };
    }

    async deleteAlbum(id: number) {
      // Verifica si el álbum existe antes de intentar eliminarlo
      const album = await this.findAlbumById(id);
      if (!album) {
        throw new NotFoundException('Album with this id does not exist');
      }
    
      // Define la consulta SQL para eliminar el álbum
      const queryDelete = `
        DELETE FROM albums
        WHERE id = $1
        RETURNING *;  -- Esta cláusula devuelve los registros eliminados
      `;
    
      // Define los parámetros de la consulta
      const paramsDelete = [id];
    
      // Ejecuta la consulta con los parámetros
      let deletedAlbum;
      try {
        // Aquí asumimos que executeTransaction soporta RETURNING
        deletedAlbum = await this.databaseService.executeTransaction(queryDelete, paramsDelete);
      } catch (error) {
        throw new InternalServerErrorException(
          '(Internal Server Error) -> ' + error,
        );
      }
    
      return { success: true, data: deletedAlbum }; // Devuelve el álbum eliminado
    }
    
    
}
