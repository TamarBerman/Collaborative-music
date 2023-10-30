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
  Put,
  Delete,
  Param,
  ForbiddenException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AdminGuard } from './admin.guard';

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
    return await this.authService.updateProfile(body.userId, body.newUser);
  }


  @UseGuards(AuthGuard)
  @Get('getuser')
  async getUser(@Request() request){
    return await this.authService.getUser(request);
  }
  // //////////////////////////////////////////////////////////////////
  // /////////////////////////////// Admin ////////////////////////////
  // //////////////////////////////////////////////////////////////////

  @UseGuards(AdminGuard)
  @Get('getallusers')
  async getAllUsers(@Request() request) {
    return await this.authService.getAllUsers();
  }

  @UseGuards(AdminGuard)
  @Delete('deleteuser/:id')
  async deleteUser(@Param('id') userId, @Request() request) {
    return await this.authService.deleteUser(userId);
  }


  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('adminlogin')
  async adminLogin(@Body() values: any,@Res({ passthrough: true }) response: any) {
    console.log('adminLogin request received:', values); // Add this line for debugging
    try {
      const token = await this.authService.adminSignIn(values.email, values.password);
      console.log('adminLogin successful. Token:', token); // Add this line for debugging
      return token;
    } catch (error) {
      console.error('adminLogin error:', error); // Add this line for debugging
      throw error;
    }
  }

}
