import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

import {
  Controller,
  UseGuards,
  Post,
  Body,
  Put,
  Get,
  Param,
  Delete,
} from '@nestjs/common';
import { SongService } from '../services/song.service';
import { CreateSongDto } from '../dtos/create-song.dto';
import { UpdateSongDto } from '../dtos/update-song.dto';
@ApiTags('Song')
@Controller('song')
export class SongController {
  constructor(private readonly songService: SongService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBody({ type: CreateSongDto })
  @ApiResponse({ status: 201, description: 'Song created successfully' })
  async createSong(@Body() createSongDto: CreateSongDto) {
    const response = await this.songService.createSong(createSongDto);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/addSongToPlaylist/:songId/:playlistId')
  @ApiResponse({
    status: 201,
    description: 'Song added to playlist successfully',
  })
  async addSongToPlaylist(
    @Param('songId') songId: string,
    @Param('playlistId') playlistId: string,
  ) {
    const numericSongId = parseInt(songId, 10);
    const numericPlaylistId = parseInt(playlistId, 10);
    const response = await this.songService.addSongToPlaylist(
      numericSongId,
      numericPlaylistId,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/addSongToAlbum/:songId/:albumId')
  @ApiResponse({ status: 201, description: 'Song added to album successfully' })
  async addSongToAlbum(
    @Param('songId') songId: string,
    @Param('albumId') albumId: string,
  ) {
    const numericSongId = parseInt(songId, 10);
    const numericAlbumId = parseInt(albumId, 10);
    const response = await this.songService.addSongToAlbum(
      numericSongId,
      numericAlbumId,
    );
    return response;
  }
  @UseGuards(JwtAuthGuard)
  @Post('/addSongToArtist/:songId/:artistId')
  @ApiResponse({
    status: 201,
    description: 'Song added to artist successfully',
  })
  async addSongToArtist(
    @Param('songId') songId: string,
    @Param('artistId') artistId: string,
  ) {
    const numericSongId = parseInt(songId, 10);
    const numericArtistId = parseInt(artistId, 10);
    const response = await this.songService.addSongToArtist(
      numericSongId,
      numericArtistId,
    );
    return response;
  }
  @UseGuards(JwtAuthGuard)
  @Delete('/deleteSongFromPlaylist/:songId/:playlistId') // Asegúrate de incluir los slashes
  @ApiResponse({
    status: 200,
    description: 'Song removed from playlist successfully',
  })
  async deleteSongFromPlaylist(
    @Param('songId') songId: string, // Cambia a string para capturarlo desde la URL
    @Param('playlistId') playlistId: string, // Cambia a string también
  ) {
    const numericSongId = parseInt(songId, 10); // Convierte a número
    const numericPlaylistId = parseInt(playlistId, 10); // Convierte a número
    const response = await this.songService.deleteSongFromPlaylist(
      numericSongId,
      numericPlaylistId,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/deleteSongFromArtist/:songId/:artistId') // Asegúrate de incluir los slashes
  @ApiResponse({
    status: 200,
    description: 'Song removed from artist successfully',
  })
  async deleteSongFromArtist(
    @Param('songId') songId: string, // Cambia a string para capturarlo desde la URL
    @Param('artistId') artistId: string, // Cambia a string también
  ) {
    const numericSongId = parseInt(songId, 10); // Convierte a número
    const numericArtistId = parseInt(artistId, 10); // Convierte a número
    const response = await this.songService.deleteSongFromArtist(
      numericSongId,
      numericArtistId,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/deleteSongFromAlbum/:songId/:albumId') // Asegúrate de incluir los slashes
  @ApiResponse({
    status: 200,
    description: 'Song removed from album successfully',
  })
  async deleteSongFromAlbum(
    @Param('songId') songId: string, // Cambia a string para capturarlo desde la URL
    @Param('albumId') albumId: string, // Cambia a string también
  ) {
    const numericSongId = parseInt(songId, 10); // Convierte a número
    const numericAlbumId = parseInt(albumId, 10); // Convierte a número
    const response = await this.songService.deleteSongFromAlbum(
      numericSongId,
      numericAlbumId,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/playlist/:playlistId')
  @ApiResponse({
    status: 200,
    description: 'The songs from the playlist were retrieved successfully.',
  })
  async getSongsFromPlaylist(
    @Param('playlistId') playlistId: string, // Cambia a string también
  ) {
    // Convierte a número
    const numericPlaylistId = parseInt(playlistId, 10); // Convierte a número
    const response =
      await this.songService.findSongsFromPlaylist(numericPlaylistId);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/album/:albumId')
  @ApiResponse({
    status: 200,
    description: 'The songs from the album were retrieved successfully.',
  })
  async getSongsFromAlbum(
    @Param('albumId') albumId: string, // Cambia a string también
  ) {
    // Convierte a número
    const numericAlbumId = parseInt(albumId, 10); // Convierte a número
    const response = await this.songService.findSongsFromAlbum(numericAlbumId);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/artist/:artistId')
  @ApiResponse({
    status: 200,
    description: 'The songs from the artist were retrieved successfully.',
  })
  async getSongsFromArtist(
    @Param('artistId') artistId: string, // Cambia a string también
  ) {
    // Convierte a número
    const numericArtistId = parseInt(artistId, 10); // Convierte a número
    const response = await this.songService.findSongsFromArtist(numericArtistId);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/replaySong/:songId')
  @ApiResponse({
    status: 200,
    description: 'The replay from the song were created successfully.',
  })
  async replaySong(
    @Param('songId') songId: string, // Cambia a string también
  ) {
    // Convierte a número
    const numericSongId = parseInt(songId, 10); // Convierte a número
    const response = await this.songService.replaySong(numericSongId);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiBody({ type: UpdateSongDto })
  @ApiResponse({ status: 200, description: 'Song updated successfully' })
  async updateSong(@Body() updateSongDto: UpdateSongDto) {
    const response = await this.songService.updateSong(updateSongDto);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':songId')
  @ApiResponse({ status: 200, description: 'Song deleted successfully' })
  async deleteSong(@Param('songId') songId: string) {
    const numericalSongId = parseInt(songId, 10);
    const response =
      await this.songService.deleteSong(numericalSongId);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('getById/:songId')
  @ApiResponse({
    status: 200,
    description: 'The song was retrieved successfully.',
  })
  async getSong(
    @Param('songId') songId: string, // Cambia a string también
  ) {
    // Convierte a número
    const numericSongId = parseInt(songId, 10); // Convierte a número
    const response = await this.songService.findSongById(numericSongId);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('top20')
  @ApiResponse({
    status: 200,
    description: 'The songs was retrieved successfully.',
  })

  async getTop20Songs( // Cambia a string también
  ) {
    // Convierte a número// Convierte a número
    const response = await this.songService.top20Songs();
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('getSongsByGenreId/:genreId')
  @ApiResponse({
    status: 200,
    description: 'The songs were retrieved successfully.',
  })
  async getSongsByGenreId(
    @Param('genreId') genreId: string, // Cambia a string también
  ) {
    // Convierte a número
    const numericGenreId = parseInt(genreId, 10); // Convierte a número
    const response = await this.songService.findSongsByGenreId(numericGenreId);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('getRandomSongs/:n')
  @ApiResponse({
    status: 200,
    description: 'The random songs were retrieved successfully.',
  })
  async getRandomSongs(
    @Param('n') n: string, // Cambia a string también
  ) {
    // Convierte a número
    const numericN = parseInt(n, 10); // Convierte a número
    const response = await this.songService.getRandomSongs(numericN);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('getSongsByWord/:word')
  @ApiResponse({
    status: 200,
    description: 'The songs were retrieved successfully.',
  })
  async getSongsByWord(
    @Param('word') word: string, // Cambia a string también
  ) {
    const response = await this.songService.findSongsforSearchEngine(word);
    return response;
  }
}
