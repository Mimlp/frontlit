import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BookInterface} from '../interfaces/book.interface';
import {ChapterInterface} from '../interfaces/chapter.interface';
import {tap} from 'rxjs';
import {TagInterface} from '../interfaces/tag.interface';

export interface CreateChapterDto {
  chapterTitle: string;
  chapterText: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private http = inject(HttpClient);
  baseApiUrl: string = 'http://localhost:8080';


  private currentBook = signal<BookInterface | null>(null);
  book$ = this.currentBook.asReadonly();

  updateBookState(book: BookInterface) {
    this.currentBook.set(book);
  }

  // 📥 загрузка книги
  loadBook(id: number) {
    this.http.get<BookInterface>(`${this.baseApiUrl}/books/${id}`)
      .subscribe(book => {
        this.currentBook.set(book);
      });
  }

  // 📖 получить главу (оставляем как есть)
  getChapter(id: number) {
    return this.http.get<ChapterInterface>(`${this.baseApiUrl}/books/chapters/${id}`);
  }

  // ➕ создание главы
  createChapter(bookId: number, chapter: CreateChapterDto) {
    return this.http.post<ChapterInterface>(`${this.baseApiUrl}/books/${bookId}/chapters`, chapter)
      .pipe(
        tap(newChapter => {
          const book = this.currentBook();
          if (!book) return;

          this.currentBook.set({
            ...book,
            chapters: [...book.chapters, newChapter]
          });
        })
      );
  }

  // ✏️ обновление главы
  updateChapter(chapter: ChapterInterface, id: number) {
    return this.http.put<ChapterInterface>(`${this.baseApiUrl}/books/chapters/${id}`, chapter)
      .pipe(
        tap(updated => {
          const book = this.currentBook();
          if (!book) return;

          this.currentBook.set({
            ...book,
            chapters: book.chapters.map(c =>
              c.chapterId === id ? updated : c
            )
          });
        })
      );
  }

  // 🗑 удаление главы
  deleteChapter(id: number) {
    return this.http.delete(`${this.baseApiUrl}/books/chapters/${id}`)
      .pipe(
        tap(() => {
          const book = this.currentBook();
          if (!book) return;

          this.currentBook.set({
            ...book,
            chapters: book.chapters.filter(c => c.chapterId !== id)
          });
        })
      );
  }
  updateBook(bookId: number, title: string, description: string) {
    return this.http.put<BookInterface>(`${this.baseApiUrl}/books/${bookId}`, {title, description});
  }
  getBook(id: number) {
    return this.http.get<BookInterface>(`${this.baseApiUrl}/books/${id}`)
  }
  getBooks() {
    return this.http.get<BookInterface[]>(`${this.baseApiUrl}/books`)
  }
  getBooksByUserId(userId: number) {
    return this.http.get<BookInterface[]>(`${this.baseApiUrl}/users/${userId}/books`)
  }
  getMyBooks() {
    return this.http.get<BookInterface[]>(`${this.baseApiUrl}/users/me/books`)
  }
  getAllTags() {
    return this.http.get<TagInterface[]>(`${this.baseApiUrl}/tags`)
  }
}
