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
  avatar?: string; // URL de l'avatar stocké dans MinIO
  bio?: string; // Biographie de l'utilisateur
  deleted?: boolean; // Indique si le compte a été supprimé/anonymisé
}
