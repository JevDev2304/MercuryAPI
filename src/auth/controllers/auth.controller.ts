import { Controller , Post, Request, UseGuards} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private  readonly authService: AuthService){}

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Request() req){
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        return this.authService.login(req.user,ip);
    }
}
