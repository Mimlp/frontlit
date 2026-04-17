// src/app/data/services/book.service.ts
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BookInterface } from '../interfaces/book.interface';
import { ChapterInterface } from '../interfaces/chapter.interface';
import { TagInterface } from '../interfaces/tag.interface';
import { tap } from 'rxjs';

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

  book = signal<BookInterface | null>(null);

  loadBook(id: number) {
    this.http.get<BookInterface>(`${this.baseApiUrl}/books/${id}`)
      .subscribe(book => {
        this.book.set(book);
      });
  }

  getChapter(id: number) {
    return this.http.get<ChapterInterface>(`${this.baseApiUrl}/books/chapters/${id}`);
  }

  createChapter(bookId: number, chapter: CreateChapterDto) {
    return this.http.post<ChapterInterface>(`${this.baseApiUrl}/books/${bookId}/chapters`, chapter)
      .pipe(
        tap(newChapter => {
          const book = this.book();
          if (!book) return;
          this.book.set({
            ...book,
            chapters: [...book.chapters, newChapter]
          });
        })
      );
  }

  updateChapter(chapter: ChapterInterface, id: number) {
    return this.http.put<ChapterInterface>(`${this.baseApiUrl}/books/chapters/${id}`, chapter)
      .pipe(
        tap(updated => {
          const book = this.book();
          if (!book) return;
          this.book.set({
            ...book,
            chapters: book.chapters.map(c =>
              c.chapterId === id ? updated : c
            )
          });
        })
      );
  }

  deleteChapter(id: number) {
    return this.http.delete(`${this.baseApiUrl}/books/chapters/${id}`)
      .pipe(
        tap(() => {
          const book = this.book();
          if (!book) return;
          this.book.set({
            ...book,
            chapters: book.chapters.filter(c => c.chapterId !== id)
          });
        })
      );
  }

  updateBook(bookId: number, title: string, description: string) {
    return this.http.put<BookInterface>(`${this.baseApiUrl}/books/${bookId}`, { title, description });
  }

  updateBookTags(bookId: number, tagIds: number[]) {
    return this.http.put<BookInterface>(
      `${this.baseApiUrl}/books/${bookId}/tags`,
      tagIds
    ).pipe(
      tap(updatedBook => {
        const current = this.book();
        if (current?.bookId === bookId) {
          this.book.set(updatedBook);
        }
      })
    );
  }
  searchBooks(keyword?: string, tagIds?: number[]) {
    const params: any = {};
    if (keyword) params.keyword = keyword;
    if (tagIds?.length) params.tagIds = tagIds;

    return this.http.get<BookInterface[]>(`${this.baseApiUrl}/books/search`, { params });
  }

  getBook(id: number) {
    return this.http.get<BookInterface>(`${this.baseApiUrl}/books/${id}`);
  }

  getBooks() {
    return this.http.get<BookInterface[]>(`${this.baseApiUrl}/books`);
  }

  getBooksByUserId(userId: number) {
    return this.http.get<BookInterface[]>(`${this.baseApiUrl}/users/${userId}/books`);
  }

  getMyBooks() {
    return this.http.get<BookInterface[]>(`${this.baseApiUrl}/users/me/books`);
  }

  getAllTags() {
    return this.http.get<TagInterface[]>(`${this.baseApiUrl}/tags`);
  }

  deleteBook(id: number) {
    return this.http.delete(`${this.baseApiUrl}/books/${id}`);
  }
  createTag(title: string) {
    return this.http.post<TagInterface>(`${this.baseApiUrl}/books/tags`, {tagName: title});
  }
}
