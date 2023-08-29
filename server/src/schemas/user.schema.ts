import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({versionKey:false})
export class User {

    @Prop()
    name: string;

    @Prop()
    password: string;

    @Prop({unique:true, lowercase:true})
    email: string;

    @Prop()
    isVIP: boolean;


}

export const UserSchema = SchemaFactory.createForClass(User);

// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose, { HydratedDocument } from 'mongoose';
// // export type UserDocument = HydratedDocument<User>;
// export type UserDocument = User & Document;
// @Schema()
// export class User{
//   @Prop()
//   username: string;
//   @Prop({ required: true })
//   email: string;
//   @Prop({ required: true })
//   password: string;
//   @Prop()
//   token: string;
//   @Prop()
//   VIP: boolean;
// }

// export const UserSchema = SchemaFactory.createForClass(User);

// export const UserModel = mongoose.model<UserDocument>('User', UserSchema);
