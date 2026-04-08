import {Component, inject, Signal, signal} from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [
    RouterLink
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  authService = inject(AuthService);
  isAuth = this.authService.isAuth;
}
