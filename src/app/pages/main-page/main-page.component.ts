import {Component, inject} from '@angular/core';
import {ProfileCardComponent} from '../../common-ui/profile-card/profile-card.component';
import {UserInterface} from '../../data/interfaces/user.interface';
import {UserService} from '../../data/services/user.service';
import {BookCardComponent} from '../../common-ui/book-card/book-card.component';
import {BookService} from '../../data/services/book.service';
import {BookInterface} from '../../data/interfaces/book.interface';

@Component({
  selector: 'app-main-page',
  imports: [
    ProfileCardComponent,
    BookCardComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {
  users: UserInterface[] = [];
  userService = inject(UserService);
  books: BookInterface[] = [];
  bookService = inject(BookService);
  constructor() {
    this.userService.getAccounts()
      .subscribe(
        value => {
          this.users = value
        }
      )
    this.bookService.getBooks()
      .subscribe(
      value => {
        this.books = value
      }
    )
  }
}
