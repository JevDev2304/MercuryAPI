import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/services/user.service';
import { ArtistService } from 'src/artist/services/artist.service';
import { DatabaseService } from 'src/database/database.service';
import { HashService } from 'src/crypt/services/hash.service';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { LoginUserDto } from '../login.dto';


@Injectable()
export class AuthService {
    constructor(
        private databaseService : DatabaseService,
        private userService : UserService,
        private artistService : ArtistService,
        private hashService: HashService,
        private jwtService : JwtService
    ){}
    async validateUser(email: string , password: string){
        const user = (await this.userService.findUserByEmail(email));

        if (user && user.data.length === 1 && await this.hashService.validatePassword(password,user.data[0].password)){
            const { password, ...result } = user.data[0];
            const final_result  = {...result, 'role':'user'}
            return final_result
        }
        else{
            const artist = (await this.artistService.findArtistByEmail(email))
            if (artist && artist.data.length === 1 && await this.hashService.validatePassword(password,artist.data[0].password)){
            const { password, ...result } = artist.data[0];
            const final_result  = {...result, 'role':'artist'}

            return final_result
            }
        }
        
        return null
    }

    async login(user:LoginUserDto, ip:string){
        let query: string;
        let params: any[];
    
        const payload = { username: user.email, sub: user.id, role: user.role };
    
        if (user.role === 'user') {
            query = 'INSERT INTO histories_user (user_id, ip) VALUES ($1, $2) RETURNING *';
            params = [user.id, ip];
        } else if (user.role === 'artist') {
            query = 'INSERT INTO histories_artist (artist_id, ip) VALUES ($1, $2) RETURNING *';
            params = [user.id, ip];
        } else {
            throw new BadRequestException('Invalid user role');
        }
    
        try {
            await this.databaseService.executeTransaction(query, params);
        } catch (error) {
            throw new InternalServerErrorException('Database transaction failed');
        }
    
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
