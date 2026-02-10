import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.html',
  styleUrl: './user-edit.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink]
})
export class UserEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isLoading = this.userService.isLoading;
  protected readonly error = this.userService.error;
  protected readonly userId = signal<number>(0);
  protected readonly userEmail = signal('');

  protected readonly userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    role: ['USER', [Validators.required]]
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.userId.set(id);
    this.loadUser(id);
  }

  private loadUser(id: number): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        const user = users.find(u => u.id === id);
        if (user) {
          this.userEmail.set(user.email);
          this.userForm.patchValue({ name: user.name, role: user.role });
        } else {
          this.router.navigate(['/users']);
        }
      }
    });
  }

  protected onSubmit(): void {
    if (this.userForm.invalid) return;

    this.userService.update(this.userId(), this.userForm.value).subscribe({
      next: () => this.router.navigate(['/users'])
    });
  }
}
