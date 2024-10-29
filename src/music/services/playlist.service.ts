import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  MethodNotAllowedException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreatePlaylistDto } from '../dtos/create-playlist.dto';
import { UpdatePlaylistDto } from '../dtos/update-playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(private databaseService: DatabaseService) {}

  async findPlaylistById(id: number) {
    let query: string;
    let param: any[];
    query = 'SELECT * FROM playlists WHERE id = $1'; // Simplified the query
    param = [id];

    try {
      const result = await this.databaseService.executeTransaction(
        query,
        param,
      );

      if (result.data.length === 1) {
        return result.data[0];
      } else if (result.data.length === 0) {
        throw new NotFoundException('Does not exist a playlist with this id'); // Known exception
      } else {
        throw new MethodNotAllowedException(
          'There are more than one playlist with this ID',
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

  async findUserPlaylists(userId: number) {
    let query: string;
    let param: any[];
    query = 'SELECT * FROM playlists WHERE user_id = $1';
    param = [userId];

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

  async createPlaylist(playlist: CreatePlaylistDto) {
    let queryCreate: string;
    let paramsCreate: any[];
    queryCreate =
      'INSERT INTO playlists (user_id, name, is_public) VALUES ($1, $2, $3) RETURNING *';
    paramsCreate = [playlist.userId, playlist.name, playlist.isPublic];
    try {
      const result = await this.databaseService.executeTransaction(
        queryCreate,
        paramsCreate,
      );
      return result;
    } catch (error) {
      if (error === '23503') {
        throw new NotFoundException('Does not exist a User with this ID ');
      } else if (error === '22P02') {
        throw new BadRequestException(
          'You can only use (true,false) in isPublic',
        );
      }
      throw new InternalServerErrorException(
        '(Internal Server Error) -> ' + error,
      );
    }
  }
  async updatePlaylist(payload: UpdatePlaylistDto) {
    const { isPublic, ...rest } = payload;
    let payloadWithCorrectIsPublic = { is_public: isPublic, ...rest };
    const playlistBeforeChange = await this.findPlaylistById(payload.id);

    if (!playlistBeforeChange) {
      throw new NotFoundException('Playlist with this id does not exist');
    }
    const { id, ...payloadWithoutId } = payloadWithCorrectIsPublic;

    // Combina los datos anteriores del usuario con los nuevos del payload
    const playlist = { ...playlistBeforeChange, ...payloadWithoutId };
    console.log(playlist);

    // Define la consulta SQL para actualizar el usuario
    const queryUpdate = `
            UPDATE playlists 
            SET user_id = $2, 
                name = $3, 
                is_public = $4, 
                created_at = $5
            WHERE id = $1
        `;

    // Define los parámetros de la consulta en el orden correspondiente
    const paramsUpdate = [
      id,
      playlist.user_id,
      playlist.name,
      playlist.is_public,
      playlist.created_at,
    ];

    // Ejecuta la consulta con los parámetros
    try {
      await this.databaseService.executeTransaction(queryUpdate, paramsUpdate);
    } catch (error) {
      if (error === '22P02') {
        throw new BadRequestException(
          'You can only use (true,false) in isPublic',
        );
      }
      throw new InternalServerErrorException(
        '(Internal Server Error) -> ' + error,
      );
    }

    return { success: true, data: playlist };
  }
}
