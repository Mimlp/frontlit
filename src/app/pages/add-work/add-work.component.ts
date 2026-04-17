import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-work',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-work.component.html',
  styleUrls: ['./add-work.component.scss']
})
export class AddWorkComponent {
  form: FormGroup = new FormGroup({
    title: new FormControl<string | null>(null, Validators.required),
    description: new FormControl<string | null>(null, Validators.required)
  });
  baseApiUrl: string = 'http://localhost:8080/user'

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (this.form.invalid) return;

    const payload = this.form.value;

    this.http.post<number>(`${this.baseApiUrl}/me/addwork`, payload).subscribe({
      next: (bookId) => {
        this.router.navigate(['/book', bookId]);
      },
      error: (err) => {
        console.error('Ошибка при добавлении книги', err);
      }
    });
  }
}
