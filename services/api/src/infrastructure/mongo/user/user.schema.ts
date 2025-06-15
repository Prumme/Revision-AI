import { Schema, Document, Types } from 'mongoose';

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  subscriptionTier: { type: String, required: true, default: 'free' },
  customerId: { type: String, required: false },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  address: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    postalCode: { type: String, required: false },
    country: { type: String, required: false },
  },
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
  subscriptionTier: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}
