export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  lastUpdatedPassword: Date;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  customerId?: string; // Optional, as not all users may be customers
}
