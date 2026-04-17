import { Component, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { filter } from 'rxjs';
import {FilterByPipe} from '../../pipes/filter-by.pipe';
import {BookService} from '../../data/services/book.service';
import {UserService} from '../../data/services/user.service';
import {BooklistService} from '../../data/services/booklist.service';
import {BookListInterface} from '../../data/interfaces/booklist.interface';
import {TagInterface} from '../../data/interfaces/tag.interface';

@Component({
  selector: 'app-book-page',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FormsModule, FilterByPipe],
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.scss'
})
export class BookPageComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private userService = inject(UserService);
  private booklistService = inject(BooklistService);

  book = this.bookService.book;

  isEditing = signal(false);
  editTitle = signal('');
  editDescription = signal('');
  showCreateTagInput = signal(false);
  newTagName = signal('');
  creatingTag = signal(false);
  tagCreateError = signal<string | null>(null);

  showBooklistSelector = signal(false);
  userBooklists = signal<BookListInterface[]>([]);
  loadingBooklists = signal(false);
  selectedBooklistId = signal<number | null>(null);

  showTagSelector = signal(false);
  allTags = signal<TagInterface[]>([]);
  loadingTags = signal(false);
  selectedTagIds = signal<Set<number>>(new Set());
  tagSearchQuery = signal('');

  constructor() {
    this.route.paramMap.pipe(
      map(params => params.get('bookId')),
      filter((id): id is string => !!id),
      map(id => +id),
      distinctUntilChanged()
    ).subscribe(bookId => {
      this.bookService.loadBook(bookId);
    });
  }

  currentUserIsAuthor = computed(() => {
    const book = this.bookService.book();
    return book?.userRights?.author ?? false;
  });

  currentUserIsAuthenticated = computed(() => {
    const book = this.bookService.book();
    return book?.userRights?.authenticated ?? false;
  });

  startEditing() {
    const book = this.book();
    if (book) {
      this.editTitle.set(book.title);
      this.editDescription.set(book.description || '');
      this.isEditing.set(true);
    }
  }

  saveChanges() {
    const book = this.book();
    if (!book) return;

    this.bookService.updateBook(book.bookId, this.editTitle(), this.editDescription())
      .subscribe({
        next: (updatedBook) => {
          this.bookService.book.set(updatedBook);
          this.isEditing.set(false);
        },
        error: (error) => {
          console.error('Ошибка при сохранении:', error);
        }
      });
  }

  cancelEditing() {
    this.isEditing.set(false);
    this.editTitle.set('');
    this.editDescription.set('');
  }

  deleteBook() {
    const bookId = this.book()?.bookId;
    if (!bookId) return;

    if (!confirm('Вы уверены, что хотите удалить эту книгу?')) {
      return;
    }

    this.bookService.deleteBook(bookId).subscribe({
      next: () => {
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('Ошибка при удалении книги:', error);
        alert('Не удалось удалить книгу. Попробуйте позже.');
      }
    });
  }

  protected openBooklistSelector() {
    this.loadingBooklists.set(true);
    this.selectedBooklistId.set(null);

    this.booklistService.findMyBooklists().subscribe({
      next: (lists) => {
        this.userBooklists.set(lists);
        this.loadingBooklists.set(false);
        this.showBooklistSelector.set(true);
      },
      error: (err) => {
        console.error('Ошибка загрузки списков:', err);
        alert('Не удалось загрузить ваши списки');
        this.loadingBooklists.set(false);
      }
    });
  }

  protected addBookToSelectedList() {
    const bookId = this.book()?.bookId;
    const listId = this.selectedBooklistId();

    if (!bookId || !listId) {
      alert('Выберите список для добавления');
      return;
    }

    this.booklistService.addBookToList(listId, bookId).subscribe({
      next: () => {
        this.showBooklistSelector.set(false);
        alert('Книга успешно добавлена в список!');
      },
      error: (err) => {
        console.error('Ошибка при добавлении в список:', err);
        if (err.status === 409) {
          alert('Эта книга уже есть в выбранном списке');
        } else {
          alert('Не удалось добавить книгу в список');
        }
      }
    });
  }

  protected closeBooklistSelector() {
    this.showBooklistSelector.set(false);
    this.selectedBooklistId.set(null);
  }

  // 🔹 Методы для тегов
  protected openTagSelector() {
    this.loadingTags.set(true);
    this.tagSearchQuery.set('');

    const currentTags = this.book()?.tags || [];
    this.selectedTagIds.set(new Set(currentTags.map(t => t.tagId)));

    this.bookService.getAllTags().subscribe({
      next: (tags) => {
        this.allTags.set(tags);
        this.loadingTags.set(false);
        this.showTagSelector.set(true);
      },
      error: (err) => {
        console.error('Ошибка загрузки тегов:', err);
        alert('Не удалось загрузить список тегов');
        this.loadingTags.set(false);
      }
    });
  }

  protected toggleTagSelection(tagId: number) {
    const current = this.selectedTagIds();
    const updated = new Set(current);

    if (updated.has(tagId)) {
      updated.delete(tagId);
    } else {
      updated.add(tagId);
    }
    this.selectedTagIds.set(updated);
  }

  protected isTagSelected(tagId: number): boolean {
    return this.selectedTagIds().has(tagId);
  }

  protected saveSelectedTags() {
    const bookId = this.book()?.bookId;
    if (!bookId) return;

    const tagIds = Array.from(this.selectedTagIds());

    this.bookService.updateBookTags(bookId, tagIds).subscribe({
      next: (updatedBook) => {
        this.bookService.book.set(updatedBook);
        this.showTagSelector.set(false);
        alert('Теги успешно обновлены!');
      },
      error: (err) => {
        console.error('Ошибка при сохранении тегов:', err);
        alert('Не удалось сохранить теги');
      }
    });
  }

  protected closeTagSelector() {
    this.showTagSelector.set(false);
    this.selectedTagIds.set(new Set());
    this.tagSearchQuery.set('');
  }

  protected showNewTagInput() {
    this.showCreateTagInput.set(true);
    this.newTagName.set('');
    this.tagCreateError.set(null);
    // Фокус на поле ввода после рендера
    setTimeout(() => {
      const input = document.querySelector('#new-tag-input') as HTMLInputElement;
      input?.focus();
    }, 50);
  }

  protected hideNewTagInput() {
    this.showCreateTagInput.set(false);
    this.newTagName.set('');
    this.tagCreateError.set(null);
  }

  protected async createNewTag() {
    const tagName = this.newTagName().trim();

    if (!tagName) {
      this.tagCreateError.set('Введите название тега');
      return;
    }

    if (tagName.length < 1 || tagName.length > 50) {
      this.tagCreateError.set('Название тега должно быть от 1 до 50 символов');
      return;
    }

    this.creatingTag.set(true);
    this.tagCreateError.set(null);

    try {
      const newTag = await this.bookService.createTag(tagName).toPromise();

      if (newTag) {
        const currentTags = this.allTags();
        this.allTags.set([...currentTags, newTag]);

        const selected = new Set(this.selectedTagIds());
        selected.add(newTag.tagId);
        this.selectedTagIds.set(selected);

        this.hideNewTagInput();
      }
    } catch (err: any) {
      console.error('Ошибка при создании тега:', err);

      if (err.status === 409) {
        const existingTag = this.allTags().find(t =>
          t.tagName.toLowerCase() === tagName.toLowerCase()
        );
        if (existingTag) {
          const selected = new Set(this.selectedTagIds());
          selected.add(existingTag.tagId);
          this.selectedTagIds.set(selected);
          this.hideNewTagInput();
        } else {
          this.tagCreateError.set('Тег с таким названием уже существует');
        }
      } else {
        this.tagCreateError.set('Не удалось создать тег. Попробуйте позже.');
      }
    } finally {
      this.creatingTag.set(false);
    }
  }

  protected onTagInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.createNewTag();
    } else if (event.key === 'Escape') {
      this.hideNewTagInput();
    }
  }

}
