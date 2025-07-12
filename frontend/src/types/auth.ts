import type { User } from "./user";

export interface LoginCredentials {
  email: string;
  password: string;
  totpCode?: string; // Optional for TOTP verification
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface LoginNeedTOTP {
  needTOTP: boolean; // Indicates if TOTP verification is required
}
export interface LoginSuccess {
  access_token: string; // JWT token for authenticated requests
  user: User; // User object containing user details
}

export type LoginResponse =  LoginNeedTOTP | LoginSuccess;

export interface AuthResponse {
  user: User;
}
