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
    login: new FormControl<string | null>(null, Validators.required),
    username: new FormControl<string | null>(null, Validators.required)
  })
  onSubmit() {
    if (this.form.valid) {
      //@ts-ignore
      this.authService.register(this.form.value).subscribe(res => {
        this.router.navigate(['/verification']);
      });
    } else {
      console.warn('Форма невалидна');
    }
  }
}
