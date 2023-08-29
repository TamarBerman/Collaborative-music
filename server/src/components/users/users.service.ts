import { Injectable } from '@nestjs/common';
import { Model } from "mongoose";
import { User, UserDocument } from "src/schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";

// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async findByEmail(userEmail: string): Promise<any> {//<User | undefined> {
    const user = await this.userModel.findOne({ email: userEmail }).exec();
    // return user;
    // if (user)
      return { user: user, id: user ? user._id : null };
    // return null;
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
}
