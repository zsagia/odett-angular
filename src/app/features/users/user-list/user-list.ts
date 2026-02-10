import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink]
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);

  protected readonly users = this.userService.users;
  protected readonly isLoading = this.userService.isLoading;
  protected readonly error = this.userService.error;

  ngOnInit(): void {
    this.userService.getAll().subscribe();
  }

  protected getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'badge-admin';
      case 'EDITOR': return 'badge-editor';
      default: return 'badge-user';
    }
  }
}
