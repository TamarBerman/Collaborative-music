import { Body, Controller, Get, HttpStatus, Post, Param, Res, Query, UploadedFiles, UseInterceptors, UseGuards, UnauthorizedException, Put } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { SongService } from './song.service';
import { Song } from 'src/schemas/song.schema';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/decorators/public.decorator';


@Controller('mp3')
export class SongController {
  constructor(private songService: SongService) { }

  // uplaod a song
  @UseGuards(AuthGuard)
  @Post('/upload')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]))
  async uploadFiles(
    @UploadedFiles() files: { image?: Express.Multer.File[], file?: Express.Multer.File[] },
    @Body() details: any
  ) {
    try {
      return this.songService.uploadFile(files, details.song_details);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('You are not logged in. Please log in to perform this action.');
      }
      throw error;
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
  async search(@Query('filter') filter?: any, @Query('search') search?: string, @Query('limit') limit?: number,
    @Query('offset') offset?: number, @Query('ids') ids?: string[], @Res() res?): Promise<Song[]> {
    try {
      let songs: Song[] = [];
      console.log("filter ", filter);
      // const { select, checkbox, beginDate, endDate } = filter;
      // console.log('Received data:', select, checkbox, beginDate, endDate);
      console.log("ids", ids);
      if (ids)
        songs = await this.songService.getSongsByIds(limit, offset, ids);
      else
        songs = await this.songService.getSongs(search, limit, offset, filter);
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
          like: song.like
        };
        songObjs.push(songObj);
      });
      return res.send(songObjs);
    } catch (error: any) {
      console.error('Error fetching songs:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error fetching songs' });
    }
  }

  @Public()
  @Get('download/:songId')
  async downloadSong(@Param('songId') songId: string, @Res() res): Promise<void> {
    try {
      const song = await this.songService.findOne(songId);
      if (!song) {
        return res.status(HttpStatus.NOT_FOUND).send({ message: 'Song not found' });
      }

      // Set the appropriate response headers for the download
      res.setHeader('Content-Type', 'audio/mp3');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(song.name)}.mp3"`);
      res.setHeader('Content-Length', song.data.length);

      // Send the song data buffer as the response body
      res.send(song.data);
    } catch (error) {
      console.error('Error fetching song:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error fetching song' });
    }
  }

  // add a like to a song
  @Public()
  @Put('/addlike')
  async addLike(@Body() song_id: any
  ) {
    try {
      console.log(song_id);
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
      console.log("sif"+songId);
      // Query your database to get the like count for the specified song
      const likeCount = await this.songService.getLikeCount(songId);
      return { likeCount };
    } catch (error) {
      throw error;
    }
  }


}


// get songs for playlist
// @Get('getplaylist')
// async getSongsByIds(@Query('ids') ids: string[], @Res() res?): Promise<Song[]> {
//   try {
//     const songs: Song[] = await this.songService.getSongsByIds(ids);
//     const songObjs: any[] = [];
//     songs.forEach(song => {
//       const buffer = song.data;
//       const bufferImage = song.imageData;
//       const songObj = {
//         imageUrl: `data:${song.mimetypeImage};base64,${bufferImage.toString('base64')}`,
//         audioUrl: `data:audio/mp3;base64,${buffer.toString('base64')}`,
//         song_name: song.name,
//         song_description: song.description,
//         singer_name: song.singerName,
//         upload_date: song.uploadDate,
//         rate: song.rate,
//         permission: song.permission,
//         id: song._id
//       };
//       songObjs.push(songObj);
//     });
//     return res.send(songObjs);
//   } catch (error: any) {
//     console.error('Error fetching songs:', error);
//     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error fetching songs' });
//   }
// }

// // fetch one song
// @Post('/fetch')
// async fetchAudio(@Body() body: { fileId: string }, @Res() res) {
//   const { fileId } = body;
//   try {
//     const file = await this.songService.findById(fileId);
//     if (!file) {
//       return res.status(HttpStatus.NOT_FOUND).send({ message: 'File not found' });
//     }
//     // Assuming the file is stored in a 'data' field as a Buffer
//     const buffer = file.data;
//     const bufferImage = file.imageData;
//     const imageUrl = `data:${file.mimetypeImage};base64,${bufferImage.toString('base64')}`;
//     const audioUrl = `data:audio/mp3;base64,${buffer.toString('base64')}`;
//     const song_name = file.name;
//     const song_description = file.description;
//     const song_rate = file.rate;
//     return res.send({ audioUrl, imageUrl, song_name, song_description });
//   } catch (error) {
//     console.error('Error fetching audio:', error);
//     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error fetching audio' });
//   }
// }

// @Get('/:id')
// async getFile(@Param('id') id: string, @Res() response) {
//   const file = await this.uploadService.findOne(id);
//   if (!file) {
//     return response.status(HttpStatus.NOT_FOUND).json("error");
//   }
//   return response.status(HttpStatus.OK).json({ file })
// }





