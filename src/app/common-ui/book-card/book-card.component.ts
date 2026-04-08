import {Component, Input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {BookInterface} from '../../data/interfaces/book.interface';

@Component({
  selector: 'app-book-card',
  imports: [
    RouterLink
  ],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss'
})
export class BookCardComponent {
  @Input() book?: BookInterface;
}
