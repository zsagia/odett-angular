import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserFormComponent } from '../user-form/user-form';
import { User, CreateUserDto } from '../../models/user.model';

type ViewMode = 'list' | 'create';

@Component({
  selector: 'app-user-management',
  imports: [UserFormComponent],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent {
  private userService = inject(UserService);

  // Állapotok signal-ként
  users = signal<User[]>([]);
  viewMode = signal<ViewMode>('list');
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Hiba történt a felhasználók betöltésekor');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  showCreateForm() {
    this.viewMode.set('create');
  }

  createUser(userData: CreateUserDto) {
    this.loading.set(true);

    this.userService.create(userData).subscribe({
      next: (newUser) => {
        // Hozzáadjuk az új usert a listához
        this.users.update(current => [...current, newUser]);
        this.viewMode.set('list');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Hiba történt a felhasználó létrehozásakor');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  cancelForm() {
    this.viewMode.set('list');
  }
}
