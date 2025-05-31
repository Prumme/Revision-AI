export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  lastUpdatedPassword: Date;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
