import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class Song extends Document {

  @Prop()
  name: string;

  @Prop({ type: Buffer })
  data: Buffer;

  @Prop()
  singerName: string;

  @Prop()
  description: string;

  @Prop()
  rate: number;

  @Prop()
  permission: boolean;

  @Prop({ type: Buffer })
  imageData: Buffer;

  @Prop()
  mimetype: string;

  @Prop()
  mimetypeImage: string;

  @Prop({ default: Date.now() })
  uploadDate: Date;

  @Prop()
  like: number;
}

export const SongSchema = SchemaFactory.createForClass(Song);
