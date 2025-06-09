import { Schema, Document, Types } from 'mongoose';

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  lastUpdatedPassword: Date;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
