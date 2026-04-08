import {Component, inject} from '@angular/core';
import {BookInterface} from '../../data/interfaces/book.interface';
import {BookCardComponent} from '../../common-ui/book-card/book-card.component';
import {FormsModule} from '@angular/forms';
import {TagInterface} from '../../data/interfaces/tag.interface';
import {BookService} from '../../data/services/book.service';

@Component({
  selector: 'app-search-page',
  imports: [
    BookCardComponent,
    FormsModule
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss'
})
export class SearchPageComponent {
  books: BookInterface[] = []
  allTags: TagInterface[] = []
  bookService = inject(BookService);
  protected searchQuery: string = '';
  constructor() {
    this.bookService.getBooks().subscribe(books => {
      this.books = books;
    })
    this.bookService.getAllTags().subscribe(tags => {
      this.allTags = tags;
    })
  }

  protected onTagToggle(tagId: any, $event: Event) {

  }

  protected applyFilters() {

  }
}
