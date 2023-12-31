import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import mongoose, { Model } from "mongoose";
import { User, UserDocument } from "src/schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { adminCredentials } from '../auth/constants';


@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  // חיפוש לפי מייל אם משתמש קיים.
  async findByEmail(userEmail: string): Promise<any> {//<User | undefined> {
    const user = await this.userModel.findOne({ email: userEmail }).exec();
    if (!user) {
      return null;
    }
    return { user: user, id: user ? user._id : null };
  }
  async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ name: username }).exec();;
  }

  async createUser(user: User): Promise<any> {//<User | undefined> {
    const newUser = new this.userModel(user);
    console.log(newUser);
    newUser.save();
    return { user: newUser, id: newUser.id };
  }
  async findUserById(id: string): Promise<User> {
    return await this.userModel.findById(id).exec();
  }

  async updateUserById(userId: any, newUser: any): Promise<User> {
    try {
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { _id: userId },
          { name: newUser.username , email: newUser.email, password: newUser.password},
          { new: true }
        )
        .exec();

      if (!updatedUser) {
        console.log('User not found or update failed.');
      } else {
        console.log('User updated successfully:', updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  // רשימת כל המשתמשים
  async getAllUsers() {
    return await this.userModel.find().exec();
  }

  // מחיקת משתמש
  async deleteUser(userId: string) {
    const user_id = new mongoose.Types.ObjectId(userId);
    const findU = await this.userModel.findOne({ _id: user_id });
    if (findU.email == adminCredentials.email)
      throw new ForbiddenException('Can not delete ADMIN!');
    const u = await this.userModel.findOneAndDelete({ _id: user_id })
    if (!u)
      throw new NotFoundException(`User ${user_id} does not exist`);
    return u;
  }

}
