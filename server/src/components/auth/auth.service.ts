import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async signIn(email: string, password: string) {
    // const user = await this.usersService.findByEmail(email);
    const { user, id } = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }
    const payload = { user_id: id, password: user.password };

    return {
      access_token: await this.jwtService.signAsync(payload),
      id: id
    };
  }

  async signUp(email: string, password: string, name: string) {
    if (await this.usersService.findByEmail(email) != null) {
      throw new UnauthorizedException('go to login');
    }
    const { user, id } = await this.usersService.createUser({ email: email, password: password, name: name, isVIP: false });

    const payload = { user_id: id, password: user.password };
    return {
      access_token: await this.jwtService.signAsync(payload),
      id: id
    };
  }


  async findUserById(user_id: string) {
    const user = await this.usersService.findUserById(user_id);
    if (!user) {
      throw new UnauthorizedException();
    }
    else return user;
  }

  async updateProfile(user_id: string, newUser: any) {
    return await this.usersService.updateUserById(user_id, newUser);
  }

}
