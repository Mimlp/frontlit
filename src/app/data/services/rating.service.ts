import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommentInterface} from '../interfaces/comment.interface';
import {Observable} from 'rxjs';
import {API_CONFIG} from '../../api.config';

interface RatingStats {
  average: number;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private http = inject(HttpClient);
  private baseApiUrl: string = `${API_CONFIG.BASE_URL}/books`;
  constructor() { }

  createComment(bookId: number, comment: CommentInterface) {
    return this.http.post<CommentInterface>(`${this.baseApiUrl}/${bookId}/comments`, comment);
  }

  getBookComments(bookId: number): Observable<CommentInterface[]> {
    return this.http.get<CommentInterface[]>(`${this.baseApiUrl}/${bookId}/comments`);
  }

  updateComment(commentId:number, comment: CommentInterface) {
    return this.http.put<CommentInterface>(`${this.baseApiUrl}/comments/${commentId}`, comment);
  }

  deleteComment(commentId:number) {
    return this.http.delete(`${this.baseApiUrl}/${commentId}`);
  }

  rateBook(bookId:number, rating: number) {
    return this.http.put(`${this.baseApiUrl}/${bookId}/rate`, {rating: rating});
  }

  deleteRating(bookId:number) {
    return this.http.delete(`${this.baseApiUrl}/${bookId}/rating`);
  }

  getRating(bookId:number) {
    return this.http.get<RatingStats>(`${this.baseApiUrl}/${bookId}/rating`);
  }
}
