import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;
@Schema({ versionKey: false })
export class User {

    @Prop()
    name: string;

    @Prop()
    password: string;

    @Prop({ unique: true, lowercase: true })
    email: string;

}
export const UserSchema = SchemaFactory.createForClass(User);
