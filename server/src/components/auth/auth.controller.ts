import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
  Put
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private jwtService: JwtService) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: any, @Res({ passthrough: true }) response: any) { 
    const token = this.authService.signIn(signInDto.email, signInDto.password);
    return token;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('register')
  signUp(@Body() signUpDto: any, @Res({ passthrough: true }) response: any) { 
    const token = this.authService.signUp(signUpDto.email, signUpDto.password, signUpDto.name);
    // response.cookie("access_token", token)
    return token
  }

    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@Request() request) {
      const tokenValue = request.headers.authorization?.replace('Bearer ', '') || null;
      const decodedToken = this.jwtService.decode(tokenValue) as { user_id: string, password: string };
      const user_id = decodedToken.user_id;
      return await this.authService.findUserById(user_id);
    }


  @UseGuards(AuthGuard)
  @Put('editprofile')
  async editProfile(@Request() request, @Body() body) {
    console.log("body ", body);
    return await this.authService.updateProfile(body.userId,body.newUser );
  }



  @Public()
  @HttpCode(HttpStatus.OK)
  @Get()
  // @UseGuards(AuthGuard)
  findAll(@Req() request, @Res({ passthrough: true }) response) {
    response.cookie("access_token", "13246579", {
      domain: 'localhost',
      path: '/'
    })
  }
}
