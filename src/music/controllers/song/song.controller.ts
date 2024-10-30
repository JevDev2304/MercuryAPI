import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

import { Controller, UseGuards, Post, Body, Put ,Get, Param, Delete} from '@nestjs/common';
import { SongService } from 'src/music/services/song.service';
import { CreateSongDto } from 'src/music/dtos/create-song.dto';
import { UpdateSongDto } from 'src/music/dtos/update-song.dto';
@ApiTags('Song')
@Controller('song')
export class SongController {
    constructor(private songService: SongService){}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBody({ type: CreateSongDto })
    @ApiResponse({ status: 201, description: 'Song created successfully' })
    async createSong(@Body() createSongDto: CreateSongDto) {
      const response =
        await this.songService.createSong(createSongDto);
      return response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('/addSongToPlaylist/:songId/:playlistId') 
    @ApiResponse({ status: 201, description: 'Song added to playlist successfully' })
    async addSongToPlaylist(
      @Param('songId') songId: string,
      @Param('playlistId') playlistId: string 
    ) {
      const numericSongId = parseInt(songId, 10); 
      const numericPlaylistId = parseInt(playlistId, 10);
      const response = await this.songService.addSong(numericSongId, numericPlaylistId);
      return response;
    }

@UseGuards(JwtAuthGuard)
@Delete('/deleteSongFromPlaylist/:songId/:playlistId') // Asegúrate de incluir los slashes
@ApiResponse({ status: 200, description: 'Song removed from playlist successfully' })
async deleteSongFromPlaylist(
  @Param('songId') songId: string, // Cambia a string para capturarlo desde la URL
  @Param('playlistId') playlistId: string // Cambia a string también
) {
  const numericSongId = parseInt(songId, 10); // Convierte a número
  const numericPlaylistId = parseInt(playlistId, 10); // Convierte a número
  const response = await this.songService.deleteSongFromPlaylist(numericSongId, numericPlaylistId);
  return response;
}

@UseGuards(JwtAuthGuard)
@Get(':playlistId') 
@ApiResponse({ status: 200, description: 'The songs from the playlist were retrieved successfully.' })
async getSongsFromPlaylist(
    @Param('playlistId') playlistId: string // Cambia a string también
  ) { // Convierte a número
    const numericPlaylistId = parseInt(playlistId, 10); // Convierte a número
    const response = await this.songService.findSongsFromPlaylist(numericPlaylistId);
    return response;
  }

    
    @UseGuards(JwtAuthGuard)
    @Put()
    @ApiBody({ type: UpdateSongDto })
    @ApiResponse({ status: 200, description: 'Song updated successfully' })
    async updateSong(@Body() updateSongDto: UpdateSongDto) {
      const response =
        await this.songService.updateSong(updateSongDto);
      return response;
    }
  

}
