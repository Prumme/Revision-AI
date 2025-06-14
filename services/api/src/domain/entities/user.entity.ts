export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  lastUpdatedPassword: Date;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string; // URL de l'avatar stocké dans MinIO
  bio?: string; // Biographie de l'utilisateur
}
