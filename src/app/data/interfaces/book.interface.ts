import {ChapterInterface} from './chapter.interface';
import {UserInterface} from './user.interface';
import {TagInterface} from './tag.interface';
import {UserRights} from './user-rights.interface';

export interface BookInterface {
  bookId: number;
  title: string;
  description: string;
  publicationDate?: string;
  viewsAmount?: number;
  chapters: ChapterInterface[];
  author: UserInterface;
  tags: TagInterface[];
  userRights: UserRights;
}
