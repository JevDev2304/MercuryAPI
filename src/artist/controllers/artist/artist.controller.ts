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
    @UseGuards(JwtAuthGuard)
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

}
