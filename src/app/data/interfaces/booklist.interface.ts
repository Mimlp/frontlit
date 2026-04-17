import {BookInterface} from './book.interface';

export interface BookListInterface {
  listId: number;
  title: string;
  creationDate?: string;
  books: BookInterface[];
}
