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

    // @UseGuards(JwtAuthGuard)
    // @Get(':email')
    // async getUser(@Param('email') email:string){
    //     const response = await this.userService.findUserByEmail(email)
    //     return response
    //     }
        
    }
