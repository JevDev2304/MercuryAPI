import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/services/user.service';
import { ArtistService } from 'src/artist/services/artist.service';
import { DatabaseService } from 'src/database/database.service';


@Injectable()
export class AuthService {
    constructor(
        private databaseService : DatabaseService,
        private userService : UserService,
        private artistService : ArtistService,
        private jwtService : JwtService
    ){}
    async validateUser(email: string , password: string){
        const user = (await this.userService.findUserByEmail(email));

        if (user && user.data.length === 1 && password === user.data[0].password){
            const { password, ...result } = user.data[0];
            const final_result  = {...result, 'role':'user'}
            return final_result
        }
        else{
            const artist = (await this.artistService.findArtistByEmail(email))
            if (artist && artist.data.length === 1 && password === artist.data[0].password){
            const { password, ...result } = artist.data[0];
            const final_result  = {...result, 'role':'artist'}

            return final_result
            }
        }
        
        return null
    }

    async login(user:any, ip:string){
        const payload = {username: user.email, sub:user.id, role: user.role};
        const query = 'INSERT INTO histories (user_id, ip) VALUES ($1, $2) RETURNING *'
        const params = [user.id,ip]
        await this.databaseService.executeTransaction(query,params);
        return {
            access_token: this.jwtService.sign(payload)
        }
    }
}