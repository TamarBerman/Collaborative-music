import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Playlist } from "../../schemas/playlist.schema"
import { Model } from "mongoose";
import { UsersService } from "../users/users.service";
import { constants } from "buffer";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class PlaylistService {
    constructor(@InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
        private usersService: UsersService, private jwtService: JwtService) { }

    async addSongToPlaylist(userId: string, songId: any): Promise<Playlist> {
        try {
            const playlist = await this.playlistModel.findOne({ userId });
            if (playlist) {

                const songExists = playlist.list.find(song => song===songId.songId);
                if (!songExists) {

                    playlist.list.push(songId.songId);
                    return playlist.save();
                }
                else{
                    throw new Error("Song exists in playlist");
                    
                }
            }
            const userExists = await this.usersService.findUserById(userId);
            if (userExists) {
                // creat new playlist and add song
                await this.createPlaylist(userId, "Playlist");
                await this.addSongToPlaylist(userId, songId);
            } else {
                throw new Error("User not found");
            }
        } catch (error) {
            throw new Error(error.message||"ERROR");
        }
    }

    async createPlaylist(userId: string, playlistName: string): Promise<Playlist> {
        try {
            const playlist = new this.playlistModel({ name: playlistName, userId, list: [] });
            return playlist.save();
        } catch (error) {
            throw new Error("error in creating playlist");
        }
    }

    async removeSongFromPlaylist(userId: string, songId: any): Promise<Playlist> {
        try {
            const playlist = await this.playlistModel.findOne({ userId: userId });
            if (!playlist) {
                throw new Error('Playlist not found');
            }
            // Find the index of the song in the list array
            const index = playlist.list.findIndex(item => item === songId.songId);
            if (index !== -1) {
                // If the song exists in the playlist, remove it from the list array
                playlist.list.splice(index, 1);
                return playlist.save();
            }
            throw new Error('Song not found in the playlist');
        } catch (error) {
            throw new Error('Error removing the song from the playlist');
        }
    }

    async getLengthPlaylist(userId: string): Promise<number> {
        const playlist = await this.playlistModel.findOne({ userId: userId });
        if (playlist)
            return playlist.list.length;
        return 0;
    }

    async getSongsId(userId: string): Promise<string[]> {
        const user = await this.playlistModel.findOne({ userId: userId });
        if (user) {
            return user.list;
        }
        return null;
    }

    async getUserIdFromToken(token: string): Promise<string> {
        const tokenValue = token?.replace('Bearer ', '') || null;
        const decodedToken = this.jwtService.decode(tokenValue) as { user_id: string, password: string };
        const user_id = decodedToken.user_id;
        return user_id;
    }


}