import {Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-verification',
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.scss'
})
export class VerificationComponent {
  authService = inject(AuthService);
  router = inject(Router);
  form = new FormGroup({
    verificationCode: new FormControl<string | null>(null, Validators.required),
  })

  onSubmit() {
    if (this.form.valid) {
      const verificationCode = this.form.controls.verificationCode.value;

      if (verificationCode) { // Type guard: сужаем string | null → string
        this.authService.verify({ verificationCode }).subscribe({
          next: () => this.router.navigate(['/login']),
          error: (err) => console.error('Ошибка верификации', err)
        });
      }
    } else {
      console.warn('Форма невалидна');
    }
  }
  onResendCode() {
    this.authService.resendVerificationCode().subscribe({
      next: () => {
        console.log('Код отправлен повторно');
      },
      error: err => {
        console.error('Ошибка при повторной отправке кода', err);
      }
    });
  }

}
