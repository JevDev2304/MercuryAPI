import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { DatabaseModule } from 'src/database/database.module';
import { UserController } from './controller/user/user.controller';

@Module({
  imports:[DatabaseModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}