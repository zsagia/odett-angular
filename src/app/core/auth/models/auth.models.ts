// Bejelentkezesi keres
export interface LoginRequest {
  email: string;
  password: string;
}

// Regisztracios keres
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Autentikalt felhasznalo
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Auth valasz a backendtol
export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// Auth hibauzenet
export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}
