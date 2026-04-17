// src/app/features/search/pages/search-page/search-page.component.ts
import { Component, inject, signal, computed, effect } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import {BookService} from '../../data/services/book.service';
import {BookCardComponent} from '../../common-ui/book-card/book-card.component';
import {FormsModule} from '@angular/forms';
import {BookInterface} from '../../data/interfaces/book.interface';
import {TagInterface} from '../../data/interfaces/tag.interface';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [BookCardComponent, FormsModule],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent {
  private bookService = inject(BookService);

  books = signal<BookInterface[]>([]);
  allTags = signal<TagInterface[]>([]);
  loading = signal(false);
  initialized = signal(false);

  searchQuery = signal('');
  selectedTagIds = signal<Set<number>>(new Set());

  private searchSubject = new Subject<string>();

  constructor() {
    this.loadTags();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      this.applyFilters();
    });

    effect(() => {
      const query = this.searchQuery();
      if (this.initialized()) {
        this.searchSubject.next(query);
      }
    });
  }

  private loadTags() {
    this.bookService.getAllTags().subscribe({
      next: (tags) => {
        this.allTags.set(tags);
      },
      error: (err) => {
        console.error('Ошибка загрузки тегов:', err);
      }
    });
  }

  protected onTagToggle(tagId: number, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const current = this.selectedTagIds();
    const updated = new Set(current);

    if (checkbox.checked) {
      updated.add(tagId);
    } else {
      updated.delete(tagId);
    }
    this.selectedTagIds.set(updated);

    this.applyFilters();
  }

  protected applyFilters() {
    this.loading.set(true);

    const keyword = this.searchQuery().trim() || undefined;
    const tagIds = this.selectedTagIds().size > 0
      ? Array.from(this.selectedTagIds())
      : undefined;

    this.bookService.searchBooks(keyword, tagIds).subscribe({
      next: (results) => {
        this.books.set(results);
        this.loading.set(false);
        this.initialized.set(true);
      },
      error: (err) => {
        console.error('Ошибка поиска:', err);
        this.loading.set(false);
        alert('Не удалось выполнить поиск. Попробуйте позже.');
      }
    });
  }

  protected resetFilters() {
    this.searchQuery.set('');
    this.selectedTagIds.set(new Set());
    this.applyFilters();
  }

  activeFiltersCount = computed(() => {
    const query = this.searchQuery().trim();
    const tags = this.selectedTagIds().size;
    return (query ? 1 : 0) + tags;
  });
}
