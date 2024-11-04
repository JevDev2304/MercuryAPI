import { Controller,Post, Body, Get, Param, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ArtistService } from 'src/artist/services/artist.service';



import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateArtistDto } from 'src/artist/dtos/create-artist.dto';
import { UpdateArtistDto } from 'src/artist/dtos/update-artist.dto';
// import { UpdateUserDto } from 'src/user/dtos/update-user.dto';

@ApiTags('Artist')
@Controller('artist')
export class ArtistController {
    constructor(private readonly artistService: ArtistService) {}
    @Post()
    @ApiBody({type: CreateArtistDto})
    @ApiResponse({status: 201, description: 'Artist created successfully'})
    async createUser(@Body() createArtistDto : CreateArtistDto){
            const response = await this.artistService.createArtist(createArtistDto);
            return response
            
        }
    @UseGuards(JwtAuthGuard)
    @Put()
    @ApiBody({type: UpdateArtistDto})
    @ApiResponse({status: 200, description: 'Artist updated successfully'})
    async updateUser(@Body() updateUserDto : UpdateArtistDto){
            const response = await this.artistService.updateArtist(updateUserDto);
            return response
        }
    @UseGuards(JwtAuthGuard)
    @Get('getById/:artistId')
    @ApiResponse({
          status: 200,
          description: 'The artist was retrieved successfully.',
        })
    async getArtist(
    @Param('artistId') artistId: string, // Cambia a string también
        ) {
          // Convierte a número
          const numericArtistId = parseInt(artistId, 10); // Convierte a número
          const response = await this.artistService.findArtistById(numericArtistId);
          const {password, ...rest} = response;
          return rest;
        }

}
