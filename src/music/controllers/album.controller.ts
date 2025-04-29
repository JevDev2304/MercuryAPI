import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

import { Controller, UseGuards, Post, Body, Put ,Get, Param, Delete} from '@nestjs/common';
import { CreateAlbumDto } from '../dtos/create-album.dto';
import { UpdateAlbumDto } from '../dtos/update-album.dto';
import { AlbumService } from '../services/album.service';

@ApiTags('Album')
@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBody({ type: CreateAlbumDto })
  @ApiResponse({ status: 201, description: 'Album created successfully' })
  async createAlbum(@Body() createAlbumDto: CreateAlbumDto) {
    const response =
      await this.albumService.createAlbum(createAlbumDto);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('top20')
  @ApiResponse({
  status: 200,
  description: 'The albums was retrieved successfully.',
            })
  
   async getTop20Albums(
  ) {
        const response = await this.albumService.top20Albums();
        return response;
            }

  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiBody({ type: UpdateAlbumDto })
  @ApiResponse({ status: 200, description: 'Album updated successfully' })
  async updateAlbum(@Body() UpdateAlbumDto: UpdateAlbumDto) {
    const response =
      await this.albumService.updateAlbum(UpdateAlbumDto);
    return response;
  }
  @UseGuards(JwtAuthGuard)
  @Get(':artistId')
  @ApiResponse({ status: 200, description: 'Artist albums retrieved successfully' })
  async userPlaylists(@Param('artistId') artistId: string) {
    const numericArtistId = parseInt(artistId, 10);
    const response =
      await this.albumService.findArtistAlbums(numericArtistId);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':albumId')
  @ApiResponse({ status: 200, description: 'Album deleted successfully' })
  async deleteAlbum(@Param('albumId') albumId: string) {
    const numericAlbumId = parseInt(albumId, 10);
    const response =
      await this.albumService.deleteAlbum(numericAlbumId);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('getById/:albumId')
  @ApiResponse({
        status: 200,
        description: 'The album was retrieved successfully.',
      })
  async getAlbum(
  @Param('albumId') albumId: string, // Cambia a string también
      ) {
        // Convierte a número
        const numericAlbumId = parseInt(albumId, 10); // Convierte a número
        const response = await this.albumService.findAlbumById(numericAlbumId);
        return response;
      }
      @UseGuards(JwtAuthGuard)
      @Get('getAlbumsByGenreId/:genreId')
      @ApiResponse({
            status: 200,
            description: 'The albums were retrieved successfully.',
          })
      async getSongsByGenreId(
      @Param('genreId') genreId: string, // Cambia a string también
          ) {
            // Convierte a número
            const numericGenreId = parseInt(genreId, 10); // Convierte a número
            const response = await this.albumService.findAlbumsByGenreId(numericGenreId);
            return response;
          }
    
          @UseGuards(JwtAuthGuard)
      @Get('getAlbumsByWord/:word')
      @ApiResponse({
            status: 200,
            description: 'The albums were retrieved successfully.',
          })
      async getAlbumsByWord(
      @Param('word')  word: string, // Cambia a string también
          ) {
            const response = await this.albumService.findAlbumsforSearchEngine(word);
            return response;
          }

 
}
