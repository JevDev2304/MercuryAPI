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
  constructor(private readonly databaseService: DatabaseService) {}

  async findPlaylistById(id: number) {
    const query = 'SELECT * FROM playlists WHERE id = $1';
    const result = await this.safeExecute(query, [id]);
  
    if (result?.data?.length === 1) {
      return result.data[0];
    } else if (result?.data?.length === 0) {
      throw new NotFoundException('Does not exist a playlist with this id');
    } else {
      throw new MethodNotAllowedException('There are more than one playlist with this ID');
    }
  }
  

  async findUserPlaylists(userId: number) {
    let query: string;
    let param: any[];
    query = 'SELECT * FROM playlists WHERE user_id = $1';
    param = [userId];
    let result = this.safeExecute(query,param);
    return result;
  }

  async createPlaylist(playlist: CreatePlaylistDto) {
    let queryCreate: string;
    let paramsCreate: any[];
    queryCreate =
      'INSERT INTO playlists (user_id, name, is_public) VALUES ($1, $2, $3) RETURNING *';
    paramsCreate = [playlist.userId, playlist.name, playlist.isPublic];


    let result = this.safeExecute(queryCreate,paramsCreate);
    return result;

  }
  async updatePlaylist(payload: UpdatePlaylistDto) {
    const { isPublic, ...rest } = payload;
    let payloadWithCorrectIsPublic = { is_public: isPublic, ...rest };
    const playlistBeforeChange = await this.findPlaylistById(payload.id);

    if (!playlistBeforeChange) {
      throw new NotFoundException('Playlist with this id does not exist');
    }
    const { id, ...payloadWithoutId } = payloadWithCorrectIsPublic;

    const playlist = { ...playlistBeforeChange, ...payloadWithoutId };

    const queryUpdate = `
            UPDATE playlists 
            SET user_id = $2, 
                name = $3, 
                is_public = $4, 
                created_at = $5,
                image = $6
            WHERE id = $1
        `;

    const paramsUpdate = [
      id,
      playlist.user_id,
      playlist.name,
      playlist.is_public,
      playlist.created_at,
      playlist.image
    ];
    this.safeExecute(queryUpdate,paramsUpdate);
    return { success: true, data: playlist };
  }

  private async safeExecute(query: string, params: any[]) {
    try {
      return await this.databaseService.executeTransaction(query, params);
    } catch (error) {
      console.error('Database error:', error); // Para depuración
  
      if (typeof error === 'string') {
        if (error.includes('22P02')) {
          throw new BadRequestException('You can only use (true, false) in isPublic');
        }
        if (error.includes('23503')) {
          throw new NotFoundException('Does not exist a User with this ID');
        }
      }
  
      throw new InternalServerErrorException(`(Internal Server Error) -> ${error.message || error}`);
    }
  }
  
}
