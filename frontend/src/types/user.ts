import type { Quiz } from "./quiz";

export interface User {
  id: string;
  username: string;
  email: string;
  subscriptionTier: string;
  customerId?: string;
  profilePicture?: string;
  avatar?: string;
  bio?: string;
  role: string;
  deleted?: boolean;
  blocked?: boolean;
  emailVerified?: boolean;
  lastModifiedUsernameAsked?: Date;
  lastUpdatedPassword?: Date;
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  lastName?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  TOTPSecret?: TOTPSecret;
}

export interface TOTPSecret {
  secret: string;
  otpauth_url: string;
  userId: string;
  active: boolean;
}

// Types pour le profil public
export interface PublicUser extends Partial<User> {
  id: string;
  username: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

export interface PublicProfileData {
  user: PublicUser;
  quizzes: Quiz[];
}
