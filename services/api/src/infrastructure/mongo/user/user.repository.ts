import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './user.schema';
import { User } from '@entities/user.entity';
import { UserRepository } from '@repositories/user.repository';

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const document = await this.userModel.findOne({ email }).exec();
    if (!document) return null;
    return this.documentToUser(document);
  }

  async findById(id: string): Promise<User | null> {
    const document = await this.userModel.findById(id).exec();
    if (!document) return null;
    return this.documentToUser(document);
  }

  async findAll(): Promise<User[]> {
    const documents = await this.userModel.find().exec();
    return documents.map(this.documentToUser);
  }

  private documentToUser(document: UserDocument): User {
    return {
      id: document._id.toString(),
      email: document.email,
      username: document.username,
      password: document.password,
      lastUpdatedPassword: document.lastUpdatedPassword,
      emailVerified: document.emailVerified,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  async create(user: User): Promise<User> {
    const document = await this.userModel.create(user);
    return this.documentToUser(document);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const document = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...user,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!document) {
      throw new Error('Utilisateur non trouvé');
    }

    return this.documentToUser(document);
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.userModel.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}
