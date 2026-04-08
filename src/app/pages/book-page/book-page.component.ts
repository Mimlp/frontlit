// book-page.component.ts
import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { BookService } from '../../data/services/book.service';
import { UserService } from '../../data/services/user.service';
import { FormsModule } from '@angular/forms'; // 👈 импортируем FormsModule

@Component({
  selector: 'app-book-page',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FormsModule], // 👈 добавляем FormsModule
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.scss'
})
export class BookPageComponent {

  private route = inject(ActivatedRoute);
  private bookService = inject(BookService);
  private userService = inject(UserService);

  book = this.bookService.book$;

  // 🔥 Сигналы для редактирования
  isEditing = signal(false);
  editTitle = signal('');
  editDescription = signal('');

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('bookId'));
    if (id) {
      this.bookService.loadBook(id);
    }
  }

  currentUserIsAuthor = computed(() => {
    const book = this.bookService.book$();
    return book?.userRights?.author ?? false;
  });

  // 🖊️ Начать редактирование
  startEditing() {
    const book = this.book();
    if (book) {
      this.editTitle.set(book.title);
      this.editDescription.set(book.description || '');
      this.isEditing.set(true);
    }
  }

  // 💾 Сохранить изменения
  saveChanges() {
    const book = this.book();
    if (!book) return;

    this.bookService.updateBook(book.bookId, this.editTitle(), this.editDescription())
      .subscribe({
        next: (updatedBook) => {
          this.bookService.updateBookState(updatedBook);
          this.isEditing.set(false);
        },
        error: (error) => {
          console.error('Ошибка при сохранении:', error);
        }
      });
  }

  // ❌ Отменить редактирование
  cancelEditing() {
    this.isEditing.set(false);
    this.editTitle.set('');
    this.editDescription.set('');
  }
}
