import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

import { Controller , Post, Body, Get, Param, UseGuards, Put} from '@nestjs/common';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { UserService } from 'src/user/services/user.service';
import { UpdateUserDto } from 'src/user/dtos/update-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Post()
    @ApiBody({type: CreateUserDto})
    @ApiResponse({status: 201, description: 'User created successfully'})
    async createUser(@Body() createUserDto : CreateUserDto){
            const response = await this.userService.createUser(createUserDto)
            return response
        }
    @UseGuards(JwtAuthGuard)
    @Put()
    @ApiBody({type: UpdateUserDto})
    @ApiResponse({status: 200, description: 'User updated successfully'})
    async updateUser(@Body() updateUserDto : UpdateUserDto){
            const response = await this.userService.updateUser(updateUserDto);
            return response
        }
    @UseGuards(JwtAuthGuard)
    @Get('getById/:userId')
    @ApiResponse({
            status: 200,
            description: 'The user was retrieved successfully.',
        })
    async getUser(
    @Param('userId') userId: string, // Cambia a string también
        ) {
            // Convierte a número
            const numericUserId = parseInt(userId, 10); // Convierte a número
            const response = await this.userService.findUserById(numericUserId);
            const {password, ...rest} = response;
            return rest;
        }
        
    }
