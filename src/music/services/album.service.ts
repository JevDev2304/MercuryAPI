import { Injectable, NotFoundException, MethodNotAllowedException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateAlbumDto } from '../dtos/create-album.dto';
import { UpdateAlbumDto } from '../dtos/update-album.dto';

@Injectable()
export class AlbumService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Función para manejar errores
  private handleDatabaseError(error: any) {
    if (error.code === '23503') {
      throw new NotFoundException('Does not exist a genre with this ID');
    }
    throw new InternalServerErrorException('(Internal Server Error) -> ' + error.message);
  }

  async findArtistAlbums(artistId: number) {
    const query = 'SELECT album_id, album_name, genre_id, album_description, album_creation_date, album_image FROM artists_albums_view WHERE artist_id = $1';
    const param = [artistId];

    try {
      return await this.databaseService.executeTransaction(query, param);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAlbumsByGenreId(id: number) {
    const query = 'SELECT * FROM albums WHERE genre_id = $1';
    const param = [id];

    try {
      const result = await this.databaseService.executeTransaction(query, param);
      return result.data || [];
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAlbumsforSearchEngine(word: string) {
    const query = 'SELECT * FROM albums WHERE LOWER(name) LIKE $1';
    const param = [`%${word.toLowerCase()}%`];

    try {
      const result = await this.databaseService.executeTransaction(query, param);
      return result.data || [];
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async top20Albums() {
    const query = 'SELECT * FROM albums_replays ORDER BY play_count DESC LIMIT 20;';

    try {
      return await this.databaseService.executeTransaction(query);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async findAlbumById(id: number) {
    const query = 'SELECT * FROM albums WHERE id = $1';
    const param = [id];

    try {
      const result = await this.databaseService.executeTransaction(query, param);
      if (result.data.length === 1) {
        return result.data[0];
      }
      if (result.data.length === 0) {
        throw new NotFoundException('Does not exist an album with this id');
      }
      throw new MethodNotAllowedException('There are more than one album with this ID');
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof MethodNotAllowedException) {
        throw error;
      }
      this.handleDatabaseError(error);
    }
  }

  async createAlbum(album: CreateAlbumDto) {
    const query = 'INSERT INTO albums (name, description, genre_id, image) VALUES ($1, $2, $3, $4) RETURNING *';
    const params = [album.name, album.description, album.genre_id, album.image];

    try {
      return await this.databaseService.executeTransaction(query, params);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async updateAlbum(payload: UpdateAlbumDto) {
    const albumBeforeChange = await this.findAlbumById(payload.id);
    if (!albumBeforeChange) {
      throw new NotFoundException('Album with this id does not exist');
    }

    const { id, ...payloadWithoutId } = payload;
    const album = { ...albumBeforeChange, ...payloadWithoutId };

    const query = `
      UPDATE albums 
      SET genre_id = $2, name = $3, description = $4, created_at = $5, image = $6
      WHERE id = $1
    `;

    const params = [id, album.genre_id, album.name, album.description, album.created_at, album.image];

    try {
      await this.databaseService.executeTransaction(query, params);
    } catch (error) {
      this.handleDatabaseError(error);
    }

    return { success: true, data: album };
  }

  async deleteAlbum(id: number) {
    const album = await this.findAlbumById(id);
    if (!album) {
      throw new NotFoundException('Album with this id does not exist');
    }

    const query = 'DELETE FROM albums WHERE id = $1 RETURNING *';
    const params = [id];

    try {
      return { success: true, data: await this.databaseService.executeTransaction(query, params) };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }
}
