export interface User {
  id: string;
  username: string;
  email: string;
  subscriptionTier: string;
  profilePicture?: string;
  avatar?: string;
  bio?: string;
  role: string;
  deleted?: boolean;
  blocked?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  subscriptionTier?: string;
  customerId?: string;
  firstName?: string;
  lastName?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}
