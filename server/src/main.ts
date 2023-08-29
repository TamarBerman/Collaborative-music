import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  
  app.enableCors();
  app.use(cookieParser());

  app.use(
    session({
    secret: process.env.JWT_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    // cookie: { maxAge: 3600000 }
  }))

  const corsOptions: CorsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  };
  
  app.enableCors(corsOptions);
  await app.listen(3000);
}
bootstrap();


