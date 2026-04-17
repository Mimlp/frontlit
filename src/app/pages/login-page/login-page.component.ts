import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  authService = inject(AuthService);
  router = inject(Router);
  form = new FormGroup({
    email: new FormControl<string | null>(null, Validators.required),
    password: new FormControl<string | null>(null, Validators.required),
  })
  onSubmit() {
    if (this.form.valid) {
      const email = this.form.controls.email.value;
      const password = this.form.controls.password.value;

      if (email && password) {
        this.authService.login({ email, password }).subscribe({
          next: () => this.router.navigate(['/profile']),
          error: (err) => {
            console.error('Ошибка входа', err);
          }
        });
      }
    } else {
      console.warn('Форма невалидна');
      this.form.markAllAsTouched();
    }
  }

}
