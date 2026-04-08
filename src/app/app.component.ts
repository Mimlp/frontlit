import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MenuComponent} from './common-ui/menu/menu.component';
import {UserService} from './data/services/user.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontlit';
  userService = inject(UserService);
}
