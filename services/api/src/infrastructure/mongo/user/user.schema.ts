import { Schema, Document, Types } from 'mongoose';

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  password: { type: String, required: true },
});

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  lastUpdatedPassword: Date;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
