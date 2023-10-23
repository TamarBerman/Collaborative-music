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

  async updateUserById(userId: string, newUser: User): Promise<User> {
    const updatedUser = await this.userModel.findOneAndUpdate({ _id: userId }, newUser).exec();

    if (!updatedUser) {
      // Handle the case when the user with the given ID is not found
      // For example, you can throw an exception or return null/undefined
      throw new Error('User not found');
    }
    return updatedUser;
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

  // רשימה של ID של רשימות השמעה למשתמש זה 
  async getUsersPlaylists(user_id: string) {
    try {
      const userId = new mongoose.Types.ObjectId(user_id);
      const findU = await this.userModel.findOne({ _id: userId });
      return findU.playlists;
    }
    catch (error) {
      throw new NotFoundException(`User ${user_id} does not exist`);
    }
  }
}
