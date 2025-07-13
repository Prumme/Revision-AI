import { TOTPSecret } from '@domain/value-objects/TOTPSecret';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  lastUpdatedPassword: Date;
  lastModifiedUsernameAsked: Date;
  emailVerified: boolean;
  role: string;
  subscriptionTier: string; // Niveau d'abonnement de l'utilisateur
  createdAt: Date;
  updatedAt: Date;
  customerId?: string; // Optional, as not all users may be customers
  avatar?: string; // URL de l'avatar stocké dans MinIO
  bio?: string; // Biographie de l'utilisateur
  deleted?: boolean; // Indique si le compte a été supprimé/anonymisé
  blocked?: boolean; // Indique si le compte a été bloqué par un admin

  TOTPSecret?: TOTPSecret; // Champ pour stocker des informations sensibles, comme un token de sécurité
}

export function hasTOTPEnabled(user: User): boolean {
  return !!user.TOTPSecret && user.TOTPSecret.active;
}
