export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  lastUpdatedPassword: Date;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
