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

  @Prop()
  userIdUpload: string;

  @Prop({type:[], default:['anonym']})
  artists: string[];

  @Prop({default:'anonym'})
  album: string;

  @Prop()
  duration: number;

  @Prop() //{default:"לא ידוע"}
  title: string;

  @Prop({default:"?"})
  language: string;

  @Prop({type:[]})
  genre: string[];

  @Prop({type:[]})
  comment: string;

  @Prop({default:(new Date()).getFullYear()})
  year: number;

  @Prop({default:"--"})
  description: string;;

  

}

export const SongSchema = SchemaFactory.createForClass(Song);
