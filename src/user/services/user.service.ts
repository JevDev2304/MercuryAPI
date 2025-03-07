import { Injectable, ConflictException,BadRequestException, InternalServerErrorException, MethodNotAllowedException, NotFoundException} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';// Asegúrate de importar tu servicio de base de datos
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { HashService } from 'src/crypt/services/hash.service';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService,
    private readonly hashService : HashService
  ) {}

  async findUserByEmail(email: string){
    console.log(email)
    let query : string;
    let param : any[];
    query = 'SELECT * FROM users where users.email = $1';
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

  async findUserById(id: number){
    let query : string;
    let param : any[];
    query = 'SELECT * FROM users where users.id = $1';
    param = [id]
    try{
      const result = await this.databaseService.executeTransaction(query,param);
      if (result.data.length === 1){
        return result.data[0];
      }
      else if (result.data.length === 0){
        throw new NotFoundException('Does not exist an user with this id')
      }
      else
      {
        throw new MethodNotAllowedException('There are more than one User with thid ID')
      }
      
    }
    catch(error){
      if (error instanceof NotFoundException) {
        throw  new NotFoundException('The User does not exist');
      }
      console.error(error)
      throw new InternalServerErrorException('Internal Server Error :( ')
    }

  }
   

  async createUser(user: CreateUserDto) {
    let queryCreate: string;
    let paramsCreate: any[];
    let hashedPassword = await this.hashService.hashPassword(user.password);
    if (user.country) {
      queryCreate = 'INSERT INTO users (username, email, password, country, birth) VALUES ($1, $2, $3, $4, $5) RETURNING *';
      paramsCreate = [user.username, user.email, hashedPassword, user.country.toUpperCase(), user.birth];
    } else {
      queryCreate = 'INSERT INTO users (username, email, password, birth) VALUES ($1, $2, $3, $4) RETURNING *';
      paramsCreate = [user.username, user.email, hashedPassword, user.birth];
    }
    try{
      const result = await this.databaseService.executeTransaction(queryCreate, paramsCreate);
      return result;
    }
    catch(error){
        if (error.code === '23505' || error === '23505') { 
            throw new ConflictException('Already exist an user with this username or email');
          }
        else if (error.code === '22007' || error.code === '22008'){
            throw new BadRequestException('Wrong Date Format');
          }
        else {
            throw new InternalServerErrorException('(Internal Server Error) -> ' + error)
        } 

    }
      
  }

  async updateUser(payload: UpdateUserDto) {
    if (payload.password){
      payload.password = await this.hashService.hashPassword(payload.password);
    }
    const userBeforeChange = await this.findUserById(payload.id);

    if (!userBeforeChange) {
        throw new NotFoundException('User with this id does not exist');
    }
    payload.country = payload.country.toUpperCase()
    const {id,...payloadWithoutId} = payload; 

    // Combina los datos anteriores del usuario con los nuevos del payload
    const user = { ...userBeforeChange, ...payloadWithoutId};

    // Define la consulta SQL para actualizar el usuario
    const queryUpdate = `
        UPDATE users 
        SET username = $2, 
            email = $3, 
            password = $4, 
            profile_picture = $5, 
            biography = $6, 
            country = $7, 
            birth = $8 
        WHERE id = $1
    `;

    // Define los parámetros de la consulta en el orden correspondiente
    const paramsUpdate = [
        id,                      // $1
        user.username,           // $2
        user.email,              // $3
        user.password,           // $4
        user.profile_picture,    // $5
        user.biography,          // $6
        user.country,// $7
        user.birth               // $8
    ];

    // Ejecuta la consulta con los parámetros
    try{
      await this.databaseService.executeTransaction(queryUpdate, paramsUpdate);
    }
    catch(error){
      if (error === '23505'){
        throw new ConflictException('Already exist an User with this username or email')
      }
      else if (error === '22007' || error === '22008'){
        throw new BadRequestException('Wrong Date Format');
      }
      else {
        throw new InternalServerErrorException('(Internal Server Error) -> ' + error)
      } 
    }
    
    return { success: true, data: user };
}


}
