import { TOTPSecret } from '@domain/value-objects/TOTPSecret';
import { Schema, Document, Types } from 'mongoose';

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  lastUpdatedPassword: { type: Date, default: Date.now },
  emailVerified: { type: Boolean, default: false },
  role: { type: String, required: true, default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  avatar: { type: String, required: false },
  bio: { type: String, required: false, default: '' },
  deleted: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
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
  TOTPSecret: {
    secret: { type: String, required: false },
    otpauth_url: { type: String, required: false },
    userId: { type: String, required: false }
  }
});

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  lastUpdatedPassword: Date;
  emailVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  bio?: string;
  deleted?: boolean;
  blocked?: boolean;
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
  TOTPSecret?: TOTPSecret ;
}
