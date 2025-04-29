import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

import { Controller, UseGuards, Post, Body, Put ,Get, Param} from '@nestjs/common';
import { PlaylistService } from 'src/music/services/playlist.service';
import { CreatePlaylistDto } from 'src/music/dtos/create-playlist.dto';
import { UpdatePlaylistDto } from 'src/music/dtos/update-playlist.dto';

@ApiTags('Playlist')
@Controller('playlist')
export class PlaylistController {
  constructor(private readonly  playlistService: PlaylistService) {}

  //@UseGuards(JwtAuthGuard)
  @Post()
  @ApiBody({ type: CreatePlaylistDto })
  @ApiResponse({ status: 201, description: 'Playlist created successfully' })
  async createUser(@Body() createPlaylistDto: CreatePlaylistDto) {
    const response =
      await this.playlistService.createPlaylist(createPlaylistDto);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiBody({ type: UpdatePlaylistDto })
  @ApiResponse({ status: 200, description: 'Playlist updated successfully' })
  async updatePlaylist(@Body() updatePlaylistDto: UpdatePlaylistDto) {
    const response =
      await this.playlistService.updatePlaylist(updatePlaylistDto);
    return response;
  }
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  @ApiResponse({ status: 200, description: 'User playlists retrieved successfully' })
  async userPlaylists(@Param('userId') userId: number) {
    const response =
      await this.playlistService.findUserPlaylists(userId);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('getById/:playlistId')
  @ApiResponse({
        status: 200,
        description: 'The playlist was retrieved successfully.',
      })
  async getPlaylist(
  @Param('playlistId') playlistId: string, // Cambia a string también
      ) {
        // Convierte a número
        const numericPlaylistId = parseInt(playlistId, 10); // Convierte a número
        const response = await this.playlistService.findPlaylistById(numericPlaylistId);
        return response;
      }
}
