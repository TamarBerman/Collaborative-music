import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Types } from 'mongoose';
import { adminCredentials } from './constants';

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
    const findUser = await this.usersService.findByEmail(email);
    if (findUser != null) {
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


  getUserIdFromToken(request: any) {
    // Ensure that the token starts with "Bearer " and extract the actual token value
    const tokenValue = request.headers.authorization?.replace('Bearer ', '') || null;
    // Use JwtService to decode the token and extract the payload
    const decodedToken = this.jwtService.decode(tokenValue) as { user_id: string, password: string };
    const user_id = decodedToken.user_id;
    return user_id;
  }

  // //////////////////////////////////////////////////////////////////
  // /////////////////////////////// Admin ////////////////////////////
  // //////////////////////////////////////////////////////////////////

  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    const usersList = [];
    let index: number;
    index = 0;
    users.forEach((user) => {
      const newUser = {
        key: ++index,
        username: user.name,
        password: user.password,
        email: user.email,
        isVIP: user.isVIP,
        userId: user._id,
      }
      usersList.push(newUser);
    })
    return usersList;
  }

  async deleteUser(userId: string) {
    return await this.usersService.deleteUser(userId);
  }

  async isAdminDetails(email: string, password: string) {
    if (!(email == adminCredentials.email && password == adminCredentials.password))
      return false; else return true;
  }



  async adminSignIn(email: string, password: string) {
    // const user = await this.usersService.findByEmail(email);
    const { user, id } = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException();
    }
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }
    if (!(this.isAdminDetails(email, password) && this.isAdminDetails(user?.email, user?.password))) {
      throw new ForbiddenException();
    }
    const payload = { user_id: id, password: user.password };

    return {
      access_token: await this.jwtService.signAsync(payload),
      id: id
    };
  }

}
