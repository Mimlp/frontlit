export interface BookListInterface {
  listId: number;

  title: string;
  creationDate?: string;

  userId: number;
  bookIds: number[];
}
