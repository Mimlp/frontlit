import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {UserInterface} from '../interfaces/user.interface';
import {catchError, tap} from 'rxjs';
import {API_CONFIG} from '../../api.config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  http = inject(HttpClient)
  baseApiUrl: string = `${API_CONFIG.BASE_URL}/user`

  me = signal<UserInterface | null>(null)
  constructor() {
  }

  getAccounts() {
    return this.http.get<UserInterface[]>(this.baseApiUrl)
  }

  getMe() {
    return this.http.get<UserInterface>(`${this.baseApiUrl}/me`)
      .pipe(
        tap(res => this.me.set(res))
      );
  }

  getUserById(id: number) {
    return this.http.get<UserInterface>(`${this.baseApiUrl}/${id}`)
  }

  changeDescription(payload: {profileDescription: string}) {
    return this.http.put<UserInterface>(`${this.baseApiUrl}/me/profile`, payload)
      .pipe(
        tap(res => this.me.set(res))
      )
  }
  changeUserName(payload: {userName: string}) {
    return this.http.put<UserInterface>(`${this.baseApiUrl}/me/profile`, payload)
      .pipe(
        tap(res => this.me.set(res))
      )
  }
}
