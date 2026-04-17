import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BookListInterface} from '../interfaces/booklist.interface';
import {BookInterface} from '../interfaces/book.interface';

@Injectable({
  providedIn: 'root'
})
export class BooklistService {
  private http = inject(HttpClient);
  private baseApiUrl: string = 'http://localhost:8080';

  findMyBooklists() {
    return this.http.get<BookListInterface[]>(`${this.baseApiUrl}/user/me/booklists`)
  }


  findByUser(userId: number) {
    return this.http.get<BookListInterface[]>(`${this.baseApiUrl}/user/${userId}/booklists`);
  }

  createBookList(title: string) {
    return this.http.post<BookListInterface>(`${this.baseApiUrl}/user/me/booklists`, {title: title});
  }

  addBookToList(bookListId: number, bookId: number) {
    return this.http.put<BookListInterface>(`${this.baseApiUrl}/user/me/booklists/${bookListId}/books/${bookId}`, {})
  }

  removeBookFromList(bookListId: number, bookId: number) {
    return this.http.delete(`${this.baseApiUrl}/user/me/booklists/${bookListId}/books/${bookId}`)
  }

  getBooklistById(id: number) {
    return this.http.get<BookListInterface>(`${this.baseApiUrl}/user/booklists/${id}`);
  }

  updateBooklist(listId: number, title: string) {
    return this.http.put<BookListInterface>(`${this.baseApiUrl}/user/me/booklists/${listId}`, {title: title});
  }

  deleteBookList(listId: number) {
    return this.http.delete(`${this.baseApiUrl}/user/me/booklists/${listId}`);
  }
}
