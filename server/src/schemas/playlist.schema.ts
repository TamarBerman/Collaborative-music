import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Song } from './song.schema'; // Import your Song model here
import { Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ versionKey: false })
export class Playlist extends Document {

    @Prop()
    name: string;

    @Prop()
    userId: string;

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Song' }] }) // 'Song' should match the model name or its ref property
    // list: [MongooseSchema.Types.ObjectId] ;
    list: [Types.ObjectId] ;
    
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
