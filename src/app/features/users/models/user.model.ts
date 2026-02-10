export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'EDITOR' | 'ADMIN';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: 'USER' | 'EDITOR' | 'ADMIN';
}
