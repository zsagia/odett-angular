import { Component, inject, output, input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, CreateUserDto, USER_ROLES, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements OnChanges {
  private fb = inject(FormBuilder);

  // Input: ha editálunk, a user adatait kapjuk
  userToEdit = input<User | null>(null);

  // Output events
  formSubmit = output<CreateUserDto>();
  formCancel = output<void>();

  // Elérhető szerepkörök
  roles = USER_ROLES;

  // Form definíció
  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    age: [null as number | null, [Validators.required, Validators.min(18), Validators.max(120)]],
    role: ['developer' as UserRole, Validators.required]
  });

  // Életciklus: ha van userToEdit, töltjük be az adatokat
  ngOnChanges() {
    const user = this.userToEdit();
    if (user) {
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role
      });
    } else {
      this.userForm.reset({ role: 'developer' });
    }
  }

  // Segéd getter a könnyebb template hozzáféréshez
  get f() {
    return this.userForm.controls;
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.formSubmit.emit(this.userForm.value as CreateUserDto);
    } else {
      // Összes mező megjelölése touched-ként a hibák megjelenítéséhez
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.formCancel.emit();
  }
}
