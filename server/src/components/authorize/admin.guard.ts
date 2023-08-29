
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  
  @Injectable()
  export class AdminGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const {email, password} = this.extractDetailsFromBody(request);
      if (email!="admin@iheart.music" || password!="admin@iheart.music") {
        console.log("not an admin"+ email+" "+ password);
        throw new UnauthorizedException();
      }
      console.log("admin activated"+ email+" "+ password)
      return true;
    }
  
    private extractDetailsFromBody(request: Request): any | undefined {
      const email=request.body.email;
      const password=request.body.password;
      return {email,password};
    }
  }