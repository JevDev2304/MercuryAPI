import { InternalServerErrorException , ConflictException, BadRequestException,NotFoundException, MethodNotAllowedException} from '@nestjs/common';

import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateArtistDto } from '../dtos/create-artist.dto';
import { UpdateArtistDto } from '../dtos/update-artist.dto';
import { HashService } from 'src/crypt/services/hash.service';


@Injectable()
export class ArtistService {
    constructor(private readonly databaseService: DatabaseService,
      private readonly hashService: HashService
    ) {}
    async findArtistByEmail(email: string){
        console.log(email)
        let query : string;
        let param : any[];
        query = 'SELECT * FROM artists where artists.email = $1';
        param = [email]
        try{
          const result = await this.databaseService.executeTransaction(query,param);
          return result;
        }
        catch(error){
          console.error(error)
          throw new InternalServerErrorException('Internal Server Error :( ')
        }
}
async findArtistById(id: number){
    let query : string;
    let param : any[];
    query = 'SELECT * FROM artists where artists.id = $1';
    param = [id]
    try{
      const result = await this.databaseService.executeTransaction(query,param);
      if (result.data.length === 1){
        return result.data[0];
      }
      else if (result.data.length === 0){
        throw new NotFoundException('Does not exist an artist with this id')
      }
      else
      {
        throw new MethodNotAllowedException('There are more than one Artist with thid ID')
      }
      
    }
    catch(error){
      console.error(error)
      throw new InternalServerErrorException('Internal Server Error :( ')
    }

  }

async createArtist(user: CreateArtistDto) {
    let queryCreate: string;
    let paramsCreate: any[];
    if (user.country) {
      queryCreate = 'INSERT INTO artists (name, email, password, country) VALUES ($1, $2, $3, $4) RETURNING *';
      let hashedPassword =await this.hashService.hashPassword(user.password);
      paramsCreate = [user.name, user.email, hashedPassword, user.country.toUpperCase()];
    } else {
      queryCreate = 'INSERT INTO artists (name, email, password) VALUES ($1, $2, $3) RETURNING *';
      paramsCreate = [user.name, user.email, user.password];
    }
    try{
      const result = await this.databaseService.executeTransaction(queryCreate, paramsCreate);
      return result;
    }
    catch(error){
        if (error === '23505') { 
            throw new ConflictException('Already exist an artist with this name or email');
          }
        else if (error === '22007' || error === '22008'){
            throw new BadRequestException('Wrong Date Format');
          }
        else {
            throw new InternalServerErrorException('(Internal Server Error) -> ' + error)
        } 

    }
      
  }

  async updateArtist(payload: UpdateArtistDto) {
    if(payload.password){
      payload.password = await this.hashService.hashPassword(payload.password);
    }
    const artistBeforeChange = await this.findArtistById(payload.id);
    console.log(artistBeforeChange);

    if (!artistBeforeChange) {
        throw new NotFoundException('User with this id does not exist');
    }
    payload.country = payload.country.toUpperCase()
    const {id,...payloadWithoutId} = payload; 
    console.log(payloadWithoutId);

    // Combina los datos anteriores del usuario con los nuevos del payload
    const artist = { ...artistBeforeChange, ...payloadWithoutId};
    console.log(artist);

    // Define la consulta SQL para actualizar el usuario
    const queryUpdate = `
        UPDATE artists 
        SET name = $2, 
            email = $3, 
            password = $4, 
            image = $5, 
            country = $6
        WHERE id = $1
    `;

    // Define los parámetros de la consulta en el orden correspondiente
    const paramsUpdate = [
        id,                     
        artist.name,           
        artist.email,              
        artist.password,           
        artist.image, 
        artist.country,
    ];

    // Ejecuta la consulta con los parámetros
    try{
      await this.databaseService.executeTransaction(queryUpdate, paramsUpdate);
    }
    catch(error){
      if (error === '23505'){
        throw new ConflictException('Already exist an Artist with this name or email')
      }
      else if (error === '22007' || error === '22008'){
        throw new BadRequestException('Wrong Date Format');
      }
      else {
        throw new InternalServerErrorException('(Internal Server Error) -> ' + error)
      } 
    }
    
    return { success: true, data: artist };
}



}
