import { Body, Controller, Put, Get, UseGuards, Query, Headers, Req, Post, Param, Res, HttpStatus, Delete } from "@nestjs/common";
import { PlaylistService } from "./playlist.service";
import { AuthService } from "../auth/auth.service";
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';


@Controller('mp3')
export class PlaylistController {
    constructor(private playlistService: PlaylistService, private authService: AuthService, private jwtService: JwtService) { }

    @UseGuards(AuthGuard)
    @Put('addToPlaylist')
    async addSongToPlaylist(@Req() request, @Body() body: any) {
        try {
            // פונקציה שמפענחת את הID של המשתמש מתוך התוקן
            const user_id = this.authService.getUserIdFromToken(request);
            return await this.playlistService.addSongToPlaylist(user_id, body.songId, body.playlistId);
        } catch (error) {
            if (error.message === "User not found") {
                return { message: "User not found", type: "warning", status: 404 };
            } else if (error.message === "Song exists in playlist") {
                return { message: "Song already exists in the playlist", type: "warning", status: 409 };
            } else {
                throw { message: "An error occurred", type: "error", status: 500 };
            }
        }
    }

    @UseGuards(AuthGuard)
    @Put('removeFromPlaylist')
    async removeSongFromPlaylist(@Req() request, @Body() body: any) {
        try {
            console.log(body);
            const tokenValue = request.headers.authorization?.replace('Bearer ', '') || null;
            const decodedToken = this.jwtService.decode(tokenValue) as { user_id: string, password: string };
            const user_id = decodedToken.user_id;
            return await this.playlistService.removeSongFromPlaylist(user_id, body.songId, body.playlistId);
        } catch (error) {
            throw new Error("Error removing the song from the playlist: " + error);
        }
    }

    @UseGuards(AuthGuard)
    @Get('lenplaylist')
    async getLengthPlaylist(@Req() request) {
        const user_id = await this.playlistService.getUserIdFromToken(request.headers.authorization || null);
        return await this.playlistService.getLengthPlaylist(user_id);
    }



    @UseGuards(AuthGuard)
    @Get('checkSongExists/:songId')
    async checkSongExistsInPlaylist(@Req() request, @Param('songId') songId: string) {
        try {
            const user_id = this.authService.getUserIdFromToken(request);
            return await this.playlistService.checkSongExistsInPlaylist(user_id, songId);
        } catch (error) {
            {
                throw { message: "An error occurred", type: "error", status: 500 };
            }
        }
    }

    @UseGuards(AuthGuard)
    @Get('getUserPlaylists')
    async getUserPlaylists(@Req() request) {
        try {
            const userId = await this.playlistService.getUserIdFromToken(request.headers.authorization || null);
            return await this.playlistService.getUsersPlaylistsNames(userId);
        } catch (error) {
            throw new Error(error.message)
        }

    }


    @UseGuards(AuthGuard)
    @Get('getPlaylistLength')
    async getPlaylistLength(@Req() request, @Query('playlistId') playlistId: string) {
        try {
            return await this.playlistService.getPlaylistLength(playlistId);
        } catch (error) {
            throw new Error(error.message)
        }

    }
    @UseGuards(AuthGuard)
    @Get('getPlaylist')
    async getPlaylist(@Res() res, @Query('limit') limit?: number,
        @Query('offset') offset?: number, @Query('playlistId') playlistId?: string) {
        try {
            console.log("playlistId", playlistId)
            let songs: any = [];
            const serviceResponse = await this.playlistService.getPlaylist(limit, offset, playlistId);
            songs = serviceResponse.songs || serviceResponse || [];
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
            return res.send({ songs: songObjs, songListLength: serviceResponse.songListLength });
        } catch (error: any) {
            console.error('Error fetching songs:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error fetching songs' });
        }
    }


    @UseGuards(AuthGuard)
    @Post('createPlaylist')
    async createPlaylist(@Res() res, @Req() request: any, @Body() body: any) {
        try {
            const userId = await this.playlistService.getUserIdFromToken(request.headers.authorization || null)
            console.log(`User ${userId}`);
            const newPlaylist = await this.playlistService.createPlaylist(userId, body.newPlaylistName);
            return res.send(newPlaylist);
        } catch (error: any) {
            if (error.status === 400)
                return res.status(HttpStatus.BAD_REQUEST).send({ message: error.message });
            else
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error creating a playlist' });
        }
    }

    @UseGuards(AuthGuard)
    @Delete('deletePlaylist/:playlistId')
    async deletePlaylist(@Res() res, @Param('playlistId') playlistId: string, @Body() body: any) {
        try {
            const deletedPlaylist = await this.playlistService.deletePlaylist(playlistId);
            return res.send(deletedPlaylist);
        } catch (error: any) {
            if (error.status === 400)
                return res.status(HttpStatus.BAD_REQUEST).send({ message: error.message });
            else
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error deleting a playlist' });
        }
    }

    @UseGuards(AuthGuard)
    @Put('updatePlaylistName/:playlistId')
    async editPlaylistName(@Res() res, @Param('playlistId') playlistId: string, @Body() body: any) {
        try {
            console.log("in handleEditPlaylistName", playlistId, body.newName)
            const editedPlaylist = await this.playlistService.editPlaylistName(playlistId, body.newName);
            console.log("edited: ", editedPlaylist)
            return res.send(editedPlaylist);
        } catch (error: any) {
            if (error.status === 400)
                return res.status(HttpStatus.BAD_REQUEST).send({ message: error.message });
            else
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Error editing playlist' });
        }
    }
}


// // למחוקק
// @UseGuards(AuthGuard)
// @Get('userId')
// async getUserId(@Req() request) {
//     const user_id = await this.playlistService.getUserIdFromToken(request.headers.authorization || null);
//     const songsId = await this.playlistService.getSongsId(user_id);
//     return songsId;
// }
