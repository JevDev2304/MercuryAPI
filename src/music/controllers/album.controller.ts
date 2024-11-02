import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

import { Controller, UseGuards, Post, Body, Put ,Get, Param, Delete} from '@nestjs/common';
import { CreateAlbumDto } from '../dtos/create-album.dto';
import { UpdateAlbumDto } from '../dtos/update-album.dto';
import { AlbumService } from '../services/album.service';

@ApiTags('Album')
@Controller('album')
export class AlbumController {
  constructor(private albumService: AlbumService) {}

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
}
