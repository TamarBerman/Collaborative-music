import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// export enum StatusEnum {
//   OPEN = 'open',
//   UNDER_REVIEW = 'under_review',
//   RESOLVED = 'resolved',
//   REJECTED = 'rejected',
// }


@Schema({ versionKey: false })
export class AbuseReports extends Document {

  @Prop()
  userId: string;

  @Prop()
  songId: string;

  @Prop()
  reportDate: Date;

  // @Prop({ type: 'string', enum: Object.values(StatusEnum) })
  // status: StatusEnum;

}

export const AbuseReportsSchema = SchemaFactory.createForClass(AbuseReports);
