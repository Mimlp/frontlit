import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthResponse} from './auth.interface';
import {catchError, tap, throwError} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';
import {Router} from '@angular/router';
import {UserInterface} from '../data/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient)
  router = inject(Router);
  cookieService = inject(CookieService)
  baseApiUrl: string = 'http://localhost:8080/auth'

  token = signal<string | null>(null);
  refreshToken: string | null = null;
  isAuth = computed(() => !!this.token());

  constructor() {
    if (!this.token()) {
      this.token.set(this.cookieService.get('token'));
      this.refreshToken = this.cookieService.get('refreshToken');
    }
  }

  get isAuthenticated(): boolean {
    if (!this.token()) {
      this.token.set(this.cookieService.get('token'));
      this.refreshToken = this.cookieService.get('refreshToken');
    }
    return !!this.token();
  }

  login(payload: {email: string, password: string}) {
    return this.http.post<AuthResponse>(
      `${this.baseApiUrl}/login`,
      payload
    ).pipe(
      tap(val => this.saveTokens(val))
    )
  }

  register(payload: { email: string, password: string, login: string, username: string }) {
    return this.http.post<UserInterface>(
      `${this.baseApiUrl}/signup`,
      payload,
    ).pipe(
      tap(() => {
        this.cookieService.set('email', payload.email);
      }),
      catchError(err => throwError(err))
    );
  }

  verify(payload: { verificationCode: string }) {
    const email = this.cookieService.get('email');
    return this.http.post(
      `${this.baseApiUrl}/verify`,
      {
        email: email,
        verificationCode: payload.verificationCode
      }
    );
  }

  resendVerificationCode() {
    const email = this.cookieService.get('email');

    return this.http.post(
      `${this.baseApiUrl}/resend`,
      null,
      {
        params: { email }
      }
    );
  }


  refreshAuthToken() {
    return this.http.post<AuthResponse>(
      `${this.baseApiUrl}/refresh`,
      { refreshToken: this.refreshToken }
    ).pipe(
      tap(res => {
        this.saveTokens(res)
      }),
      catchError(err => {
        this.logout()
        return throwError(err);
      })
    )
  }

  logout() {
    this.cookieService.delete('token', '/');
    this.cookieService.delete('refreshToken', '/');
    this.cookieService.deleteAll();
    this.token.set(null);
    this.refreshToken = null;
    this.router.navigate(['/login']);
  }

  saveTokens(res: AuthResponse) {
    this.token.set(res.token);
    this.refreshToken = res.refreshToken;

    this.cookieService.set('token', res.token);
    this.cookieService.set('refreshToken', res.refreshToken);
  }
}
