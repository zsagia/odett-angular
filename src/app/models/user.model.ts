// Teljes User entitás (amit az API visszaad)
export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: UserRole;
}

// Új user létrehozásához (id nélkül)
export interface CreateUserDto {
  name: string;
  email: string;
  age: number;
  role: UserRole;
}

// Módosításhoz (minden mező opcionális)
export interface UpdateUserDto {
  name?: string;
  email?: string;
  age?: number;
  role?: UserRole;
}

// Role típus korlátozása
export type UserRole = 'developer' | 'designer' | 'manager' | 'tester';

// Segéd tömb a select-hez
export const USER_ROLES: UserRole[] = ['developer', 'designer', 'manager', 'tester'];
