import { Component, inject, signal, computed, effect } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

import { UserService } from '../../data/services/user.service';
import { BookService } from '../../data/services/book.service';
import { AuthService } from '../../auth/auth.service';

import { BookInterface } from '../../data/interfaces/book.interface';
import { UserInterface } from '../../data/interfaces/user.interface';

import { BookCardComponent } from '../../common-ui/book-card/book-card.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, BookCardComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent {

  private userService = inject(UserService);
  private authService = inject(AuthService);
  private bookService = inject(BookService);
  private route = inject(ActivatedRoute);

  me = this.userService.me;

  user = signal<UserInterface | null>(null);
  books = signal<BookInterface[]>([]);

  editDescription = signal(false);

  profileId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('profileId'))
    )
  );

  thisIsMe = computed(() => {
    const me = this.me();
    const user = this.user();

    if (!me || !user) return false;

    return me.userId === user.userId;
  });

  form = new FormGroup({
    profileDescription: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  constructor() {
    effect(() => {
      const id = this.profileId();

      if (id) {
        const userId = +id;

        this.userService.getUserById(userId).subscribe(user => {
          this.user.set(user);
        });

        this.bookService.getBooksByUserId(userId).subscribe(books => {
          this.books.set(books);
        });

      } else {
        this.userService.getMe().subscribe(user => {
          this.user.set(user);
        });

        this.bookService.getMyBooks().subscribe(books => {
          this.books.set(books);
        });
      }
    });
  }

  startEdit() {
    this.form.setValue({
      profileDescription: this.user()?.profileDescription ?? ''
    });

    this.editDescription.set(true);
  }

  stopEdit() {
    this.editDescription.set(false);
  }

  onSubmit() {

    if (this.form.invalid) return;

    this.userService
      .changeDescription({
        profileDescription: this.form.controls.profileDescription.value
      })
      .subscribe(() => {

        this.user.update(u => {
          if (!u) return u;

          return {
            ...u,
            profileDescription: this.form.controls.profileDescription.value
          };
        });

        this.editDescription.set(false);

      });

  }

  logout() {
    this.authService.logout();
  }

}
