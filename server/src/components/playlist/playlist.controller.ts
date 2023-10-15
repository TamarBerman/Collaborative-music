import { Body, Controller, Put, Get, UseGuards, Query, Headers, Req, Post, Param } from "@nestjs/common";
import { PlaylistService } from "./playlist.service";
import { AuthService } from "../auth/auth.service";
import { AuthGuard } from '../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';


@Controller('mp3')
export class PlaylistController {
    constructor(private playlistService: PlaylistService, private authService: AuthService, private jwtService: JwtService) { }

    @UseGuards(AuthGuard)
    @Put('addToPlaylist')
    async addSongToPlaylist(@Req() request, @Body() songId: any) {
        try {
            // פונקציה שמפענחת את הID של המשתמש מתוך התוקן
            const user_id = this.authService.getUserIdFromToken(request);
            return await this.playlistService.addSongToPlaylist(user_id, songId);
        } catch (error) {
            console.log(error.message);
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
    async removeSongFromPlaylist(@Req() request, @Body() songId: string) {
        try {
            const tokenValue = request.headers.authorization?.replace('Bearer ', '') || null;
            const decodedToken = this.jwtService.decode(tokenValue) as { user_id: string, password: string };
            const user_id = decodedToken.user_id;
            return await this.playlistService.removeSongFromPlaylist(user_id, songId);
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
    @Get('userId')
    async getUserId(@Req() request) {
        const user_id = await this.playlistService.getUserIdFromToken(request.headers.authorization || null);
        const songsId = await this.playlistService.getSongsId(user_id);
        return songsId;
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
}
