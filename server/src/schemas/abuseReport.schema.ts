import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class AbuseReports extends Document {

  @Prop()
  userId: string;

  @Prop()
  songId: string;

  @Prop()
  reportDate: Date;

}
export const AbuseReportsSchema = SchemaFactory.createForClass(AbuseReports);
