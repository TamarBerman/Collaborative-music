import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SongController } from './song.controller';
import { SongService } from './song.service';
import { Song, SongSchema } from '../../schemas/song.schema';
import { AuthModule } from '../auth/auth.module';
import { AbuseReportsModule } from '../abuseReports/abuseReports.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Song.name, schema: SongSchema }]),
    AuthModule,
    AbuseReportsModule
  ],
  controllers: [SongController],
  providers: [SongService],
})
export class SongModule {}
