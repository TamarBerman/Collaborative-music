import { Body, Controller, Get, Delete, HttpStatus, Post, Param, Res, Query, UploadedFiles, UseInterceptors, UseGuards, UnauthorizedException, Put, Req, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { SongService } from './song.service';
import { Song } from 'src/schemas/song.schema';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { AbuseReportsService } from '../abuseReports/abuseReports.service';
import { AuthService } from '../auth/auth.service'
import { AdminGuard } from '../auth/admin.guard';
import { PlaylistService } from '../playlist/playlist.service';


@Controller('mp3')
export class SongController {
  constructor(private songService: SongService, private authService: AuthService) { }
  // , private abuseReportsService: AbuseReportsService

  // uplaod a song
  @UseGuards(AuthGuard)
  @Post('/upload')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]))
  async uploadFiles(
    @UploadedFiles() files: { image?: Express.Multer.File[], file?: Express.Multer.File[] },
    @Body() details: any,
    @Req() request,
    @Res({ passthrough: true }) res
  ) {
    try {
      const userId = this.authService.getUserIdFromToken(request)
      return this.songService.uploadFile(userId, files, details.song_details);
    } catch (error) {
      if (error.status == 401)
        return res.status(HttpStatus.UNAUTHORIZED).send({ message: 'Song not found' });
      else if (error.status == 409)
        return res.status(HttpStatus.CONFLICT).send({ message: 'Error fetching song' });
      else
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error fetching song' });
    }
  }

  // len of all songs
  @Public()
  @Get('len')
  async getLength() {
    return await this.songService.getLength();
  }

  // len of songs in search
  @Public()
  @Get('lensearch')
  async getLengthSearch(@Query('search') search: string) {
    return await this.songService.getLengthSearch(search);
  }

  // get songs for all and for search.
  @Public()
  @Get('getsongs')
  async search(@Query('filter') filter?: any, @Query('sort') sort?: any, @Query('search') search?: string, @Query('limit') limit?: number,
    @Query('offset') offset?: number, @Res() res?): Promise<Song[]> {
    try {
      console.log(`filter: ${filter}, sort: ${sort}`);
      let songs: Song[] = [];
      let serviceResponse: any = {};
      serviceResponse = await this.songService.getSongs(search, limit, offset, filter, sort);
      songs = serviceResponse.songs || serviceResponse;

      const songObjs: any[] = [];
      songs.forEach(song => {
        const buffer = song.data;
        const bufferImage = song.imageData;
        const songObj = {
          imageUrl: `data:${song.mimetypeImage};base64,${bufferImage.toString('base64')}`,
          audioUrl: `data:audio/mp3;base64,${buffer.toString('base64')}`,
          song_name: song.name,
          song_description: song.description,
          singer_name: song.singerName,
          upload_date: song.uploadDate,
          rate: song.rate,
          permission: song.permission,
          id: song._id,
          like: song.like,
          artists: song.artists || song.singerName == "" ? ['anonym'] : [song.singerName],
          album: song.album,
          duration: song.duration,
          title: song.title || song.name || "לא ידוע",
          genre: song.genre || [],
          comment: song.comment || [],
          year: song.year,
          description: song.description,
          category: song.category || ['other']
        };
        songObjs.push(songObj);
      });
      console.log(serviceResponse.songListLength || null);
      return res.send({ songs: songObjs, songListLength: serviceResponse.songListLength || null });
    } catch (error: any) {
      console.error('Error fetching songs:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error fetching songs' });
    }
  }

  // find one song
  @Public()
  @Get('getsong/:songId')
  async getSong(@Param('songId') songId: string, @Res() res?): Promise<Song[]> {
    try {
      const song = await this.songService.findSong(songId);
      if (song) {
        const buffer = song.data;
        const bufferImage = song.imageData;
        const songObj = {
          imageUrl: `data:${song.mimetypeImage};base64,${bufferImage.toString('base64')}`,
          audioUrl: `data:audio/mp3;base64,${buffer.toString('base64')}`,
          song_name: song.name,
          song_description: song.description,
          singer_name: song.singerName,
          upload_date: song.uploadDate,
          rate: song.rate,
          permission: song.permission,
          id: song._id,
          like: song.like,
          artists: song.artists || song.singerName == "" ? ['anonym'] : [song.singerName],
          album: song.album,
          duration: song.duration,
          title: song.title || song.name || "לא ידוע",
          genre: song.genre || [],
          comment: song.comment || [],
          year: song.year,
          description: song.description,
          // 
          category: song.category || ['other']
        };
        return res.send(songObj);
      }
      else
        throw new NotFoundException('nnnn');
    } catch (error) {
      if (error.status == 404)
        return res.status(HttpStatus.NOT_FOUND).send({ message: 'Song not found' });
      else
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error fetching song' });
    }
  }

  // add a like to a song
  @Public()
  @Put('/addlike')
  async addLike(@Body() song_id: any
  ) {
    try {
      return await this.songService.addLike(song_id.song_id);
    } catch (error) {
      throw error;
    }
  }

  // add a like to a song
  @Public()
  @Put('/removelike')
  async removeLike(@Body() song_id: any
  ) {
    try {
      return await this.songService.removeLike(song_id.song_id);
    } catch (error) {
      throw error;
    }
  }

  //get like count
  @Public()
  @Get('/getLikeCount/:songId')
  async getLikeCount(@Param('songId') songId: string) {
    try {
      // Query your database to get the like count for the specified song
      const likeCount = await this.songService.getLikeCount(songId);
      return { likeCount };
    } catch (error) {
      throw error;
    }
  }

  // //////////////////////////////////////////////////////////////////
  // /////////////////////////////// Admin ////////////////////////////
  // //////////////////////////////////////////////////////////////////

  // delete one song
  @UseGuards(AdminGuard)
  @Delete('deleteSong/:songId')
  async deleteSong(@Param('songId') songId: string, @Res() res?): Promise<Song[]> {
    try {
      const song = await this.songService.deleteSong(songId);
      return res.send(song);
    } catch (error: any) {
      console.error('Error fetching song:', error.status);
      if (error.status == 404)
        return res.status(HttpStatus.NOT_FOUND).send({ message: 'Song not found' });
      else
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error delering song' });
    }
  }

  // get songs for all and for search.
  @UseGuards(AdminGuard)
  @Get('getsongsinfo')
  async getSongsInfo(@Res() res?): Promise<Song[]> {
    try {
      let songsINFO: Song[] = [];
      songsINFO = await this.songService.findAll();
      const songInfoObjs: any[] = [];
      let index = 0;
      // קריאה לקבלת כל השירים שברשימה ההיא
      // const songsInAbuseReport = await this.songService.getAllAbuseReports();
      // let songsInAbuseReportSongId;
      // songsInAbuseReport.forEach((report) => {
      //   songsInAbuseReportSongId.push(report.songId);
      // })
      songsINFO.forEach(songInfo => {
        const tag = [];
        // if (songsInAbuseReport.includes(songInfo._id))
        // בדיקה אם השיר הנוכחי קיים ברשימה ההיא
        tag.push("bad");
        if (songInfo.like > 1)
          tag.push("Love");

        const songInfoObj = {
          key: ++index,
          songId: songInfo._id,
          upload_date: songInfo.uploadDate,
          rate: songInfo.rate,
          like: songInfo.like,
          artists: songInfo.artists || [songInfo.singerName],
          album: songInfo.album,
          duration: songInfo.duration,
          title: songInfo.title || songInfo.name || "לא ידוע",
          year: songInfo.year,
          description: songInfo.description,
          tags: tag,
          // 
          category: songInfo.category || ['other']

        };
        songInfoObjs.push(songInfoObj);
      });
      return res.send(songInfoObjs);
    } catch (error: any) {
      console.error('Error fetching songs:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error fetching songs' });
    }
  }

}
