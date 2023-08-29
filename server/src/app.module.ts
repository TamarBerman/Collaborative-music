/* eslint-disable @typescript-eslint/no-unused-vars */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { SongModule } from './components/mp3/song.module';
import { AuthModule } from './components/auth/auth.module';
import { UsersModule } from './components/users/users.module';
import { PlaylistModule } from './components/playlist/playlist.module';

dotenv.config();
@Module({
  imports: [MongooseModule.forRoot('mongodb://127.0.0.1:27017/musicDB'),
    AuthModule, UsersModule,
    SongModule,
    PlaylistModule
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }




