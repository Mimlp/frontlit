import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {
  authService = inject(AuthService);
  router = inject(Router);
  form = new FormGroup({
    email: new FormControl<string | null>(null, Validators.required),
    password: new FormControl<string | null>(null, Validators.required),
    username: new FormControl<string | null>(null, Validators.required)
  })
  onSubmit() {
    if (this.form.valid) {
      const email = this.form.controls.email.value;
      const password = this.form.controls.password.value;
      const username = this.form.controls.username.value;

      if (email && password&& username) {
        this.authService.register({ email, password, username }).subscribe({
          next: () => {
            this.router.navigate(['/verification']);
          },
          error: (err) => {
            console.error('Ошибка регистрации', err);
          }
        });
      }
    } else {
      console.warn('Форма невалидна');
      this.form.markAllAsTouched();
    }
  }
}
