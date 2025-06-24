export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  avatar?: string;
  bio?: string;
  role: string;
  deleted?: boolean;
  blocked?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
