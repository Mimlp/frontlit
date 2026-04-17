import {Component, effect, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {BookListInterface} from '../../data/interfaces/booklist.interface';
import {BooklistService} from '../../data/services/booklist.service';
import {BookCardComponent} from '../../common-ui/book-card/book-card.component';

@Component({
  selector: 'app-book-list',
  imports: [
    ReactiveFormsModule,
    BookCardComponent
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private booklistService = inject(BooklistService);
  bookListId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('bookListId')),
      map(id => id ? +id : null)
    ),
    {initialValue: null}
  );
  profileId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('profileId')),
      map(id => id ? +id : null)
    ),
    {initialValue: null}
  );
  bookListForm = this.fb.group({
    title: ['', Validators.required]
  });
  booklist = signal<BookListInterface | null>(null);
  createMode = false;
  editMode = false;
  editOn = false;

  constructor() {
    const blId = this.bookListId();
    if (!blId) {
      this.booklist.set(null);
      this.createMode = true;
      this.editMode = false;
      return;
    }
    this.booklistService.getBooklistById(blId).subscribe({
        next: (booklist) => {
          this.booklist.set(booklist);
          this.createMode = false;
          console.log(booklist);
          const prId = this.profileId();
          this.editMode = !prId;
        },

      error: (err) => {
        console.error('Ошибка загрузки главы:', err);
        this.booklist.set(null);
      }
      }
    )
  }

  protected createBookList() {
    if (this.bookListForm.invalid) return;
    const title = this.bookListForm.value.title;
    if (title) {
      this.booklistService.createBookList(title).subscribe({
        next: (booklist) => {
          this.router.navigate([`/profile/booklist/${booklist.listId}`]);
        },
        error: (err) => {
          alert(err.message);
        }
      })
    }
  }

  startEdit() {
    this.editOn = true;
    this.bookListForm.patchValue({ title: this.booklist()?.title });
  }

  protected editBookList() {
    if (this.bookListForm.invalid) return;
    const title = this.bookListForm.value.title;
    if (title) {
      this.booklistService.updateBooklist(this.booklist()!.listId, title).subscribe({
        next: (booklist) => {
          this.booklist.set(booklist);
          this.editOn = false;
        }
      })
    }
  }

  protected deleteBookList() {
    this.booklistService.deleteBookList(this.booklist()!.listId).subscribe({
      next: () => {
        this.router.navigate(['/profile']);
      }
    })
  }

  protected cancelEdit() {
    this.editOn = false;
  }

  protected deleteBookFromList(bookId: number) {
    const listId = this.bookListId();

    if (!listId) {
      console.error('Не удалось получить ID списка книг');
      return;
    }

    if (!confirm('Удалить эту работу из списка?')) {
      return;
    }
    this.booklistService.removeBookFromList(listId, bookId).subscribe({
      next: () => {
        const current = this.booklist();
        if (current) {
          this.booklist.set({
            ...current,
            books: current.books.filter(book => book.bookId !== bookId)
          });
        }
      },
      error: (err) => {
        console.error('Ошибка при удалении книги:', err);
        alert('Не удалось удалить книгу из списка');
      }
    });
  }
}
