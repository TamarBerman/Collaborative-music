import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PlaylistController } from "./playlist.controller";
import { PlaylistService } from "./playlist.service";
import { Playlist, PlaylistSchema } from "src/schemas/playlist.schema";
import { UsersModule } from "../users/users.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Playlist.name, schema: PlaylistSchema }]),
        UsersModule,
    ],
    controllers: [PlaylistController],
    providers: [PlaylistService],
})
export class PlaylistModule { }
