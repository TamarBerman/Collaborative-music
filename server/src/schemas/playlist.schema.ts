import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class Playlist extends Document {

    @Prop()
    name: string;

    @Prop()
    userId: string;

    @Prop({ type: [] })
    list: any[];
    
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
