import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Playlist } from "../../schemas/playlist.schema"
import mongoose, { Model } from "mongoose";
import { UsersService } from "../users/users.service";
import { constants } from "buffer";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { Song } from "src/schemas/song.schema";

@Injectable()
export class PlaylistService {
    constructor(@InjectModel(Playlist.name) private playlistModel: Model<Playlist>,
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }
    // הוספת שיר לרשימת השמעה ספציפית
    async addSongToPlaylist(userId: string, songId: string, playlistId: string): Promise<any> {
        try {
            const songObjectId = new mongoose.Types.ObjectId(songId);
            const playlist = await this.playlistModel.findOne({ _id: playlistId }).populate('list');

            if (playlist) {
                const songExists = playlist.list.find(song => song._id === songObjectId); // Assuming song has an _id
                if (!songExists) {
                    playlist.list.push(songObjectId);
                    playlist.save();
                    return { playlistId: playlist._id, name: playlist.name };

                } else {
                    throw new ForbiddenException('songExists');
                }
            } else {
                const userExists = await this.usersService.findUserById(userId);
                if (userExists) {
                    // Create a new playlist and add the song
                    const newPlaylist = await this.createPlaylist(userId, "Playlist1");
                    newPlaylist.list.push(songObjectId);
                    newPlaylist.save();
                    return { playlistId: newPlaylist._id, name: newPlaylist.name };

                } else {
                    throw new UnauthorizedException('use doesnt exists');
                }
            }
        } catch (error) {
            throw new Error(error.message || "ERROR");
        }
    }

    // הסרת שיר מרישמת השמעה
    async removeSongFromPlaylist(userId: string, songId: string, playlistId: string): Promise<any> {
        try {
            const songObjectId = new mongoose.Types.ObjectId(songId);
            const playlistObjectId = new mongoose.Types.ObjectId(playlistId);

            const playlist = await this.playlistModel.findOne({ _id: playlistObjectId });

            if (!playlist) {
                throw new Error('Playlist not found');
            }

            // Find the index of the song in the list array
            const index = playlist.list.findIndex(item => item.equals(songObjectId));

            if (index !== -1) {
                // If the song exists in the playlist, remove it from the list array
                playlist.list.splice(index, 1);
                // Save the updated playlist
                await playlist.save();
                return { playlistId: playlist._id, name: playlist.name };
            } else {
                throw new Error('Song not found in the playlist');
            }
        } catch (error) {
            throw new Error(error.message);
        }
    }


    async getLengthPlaylist(userId: string): Promise<number> {
        const playlist = await this.playlistModel.findOne({ userId: userId });
        if (playlist)
            return playlist.list.length;
        return 0;
    }

    async getSongsId(userId: string): Promise<any[]> {
        const user = await this.playlistModel.findOne({ userId: userId });
        if (user) {
            return user.list;
        }
        return null;
    }



    // בדיקה אם שיר קייים באחד הפלייליסטים של המשתמש
    async checkSongExistsInPlaylist(userId: string, songId: any): Promise<any> {
        try {
            let playlistFound = null;

            const userPlaylists = await this.playlistModel.find({ userId: userId }).populate('list').exec();

            if (!userPlaylists || userPlaylists.length === 0) {
                console.log("No playlists found");
                return null;
            }
            const songObjectId = new mongoose.Types.ObjectId(songId);
            for (const playlistItem of userPlaylists) {
                const songInPlaylist = playlistItem.list.find(item => item._id.equals(songObjectId));
                if (songInPlaylist) {
                    playlistFound = playlistItem;
                    break; // Exit the loop since we found the song in one of the playlists
                }
            }
            if (playlistFound) {
                return { playlistId: playlistFound._id, name: playlistFound.name };
            } else {
                return null;
            }
        } catch (error) {
            throw new Error('Error checking if song exists in playlist');
        }
    }

    //  חילוץ משתמש מTOKEN 
    async getUserIdFromToken(token: string): Promise<string> {
        const tokenValue = token?.replace('Bearer ', '') || null;
        const decodedToken = this.jwtService.decode(tokenValue) as { user_id: string, password: string };
        const user_id = decodedToken.user_id;
        return user_id;
    }
    // רשימת הפלייליסטים של המשתמש
    async getUsersPlaylistsNames(userId) {
        const playlists = await this.playlistModel
            .find({ userId: userId })
            .select('name _id')
            .exec();

        // Map the results to the desired format
        const formattedPlaylists = playlists.map(playlist => ({
            name: playlist.name,
            playlistId: playlist._id
        }));
        return formattedPlaylists;
    }

    // אורך פלייליסט
    async getPlaylistLength(playlistId) {
        const playlist_id = new mongoose.Types.ObjectId(playlistId);
        const playlist = await this.playlistModel.findOne({ _id: playlist_id }).populate('list').exec();
        return playlist.list.length;
    }

    // קבלת השירים בפלייליסט
    async getPlaylist(limit: number, offset: number, playlistId: string) {
        try {
            const playlist_id = new mongoose.Types.ObjectId(playlistId);
            const playlist = await this.playlistModel.findOne({ _id: playlist_id })
                .populate('list').exec();
            const songs = playlist.list.slice(offset, offset + limit);;
            return { songs: songs, songListLength: playlist.list.length };


        } catch (error) {
            // Handle any errors that occur during the database operation
            throw new Error('Error retrieving songs: ' + error);
        }
    }

    // יצירת פללייליסט חדש
    async createPlaylist(userId: string, playlistName: string): Promise<Playlist> {
        try {
            const playlistExists = await this.checkPlaylistExists(userId, playlistName);
            if (playlistExists) {
                throw new BadRequestException('alreade playlist with the same name');
            }
            else {
                const playlist = new this.playlistModel({ name: playlistName, userId: userId, list: [] });
                return playlist.save();
            }
        } catch (error) {
            throw error;
        }
    }

    // מחיקת פלייליסט
    async deletePlaylist(playlistId: string): Promise<Playlist> {
        return await this.playlistModel.findOneAndDelete({ _id: playlistId })
    }

    // עריכת שם לפלייליסט
    async editPlaylistName(playlistId: string, newName: string): Promise<Playlist> {
        return await this.playlistModel.findOneAndUpdate({ _id: playlistId },
            { name: newName },
            { new: true })
    }

    // בודק שלא קיים לאותו משתמש פלייליסט זהה
    async checkPlaylistExists(userId: string, playlistName: string): Promise<Playlist> {
        const playlist = await this.playlistModel.findOne({ userId: userId, name: playlistName })
        return playlist;
    }




}