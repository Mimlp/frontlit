import {Routes} from '@angular/router';
import {MainPageComponent} from './pages/main-page/main-page.component';
import {ProfilePageComponent} from './pages/profile-page/profile-page.component';
import {canActivateAuth} from './auth/access.guard';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {RegisterPageComponent} from './pages/register-page/register-page.component';
import {VerificationComponent} from './pages/verification/verification.component';
import {AddWorkComponent} from './pages/add-work/add-work.component';
import {BookPageComponent} from './pages/book-page/book-page.component';
import {ChapterComponent} from './pages/chapter/chapter.component';
import {SearchPageComponent} from './pages/search-page/search-page.component';
import {BookListComponent} from './pages/book-list/book-list.component';

export const routes: Routes = [
  {path: '', component: MainPageComponent},
  {
    path: 'profile', component: ProfilePageComponent,
    canActivate: [canActivateAuth]
  },

  // ← КОНКРЕТНЫЕ маршруты ПЕРЕД параметризованными!
  {path: 'profile/booklist', component: BookListComponent},
  {path: 'profile/booklist/:bookListId', component: BookListComponent},
  {path: 'profile/:profileId/booklist/:bookListId', component: BookListComponent},

  // ← Потом маршруты с параметрами
  {path: 'profile/:profileId', component: ProfilePageComponent},

  {path: 'login', component: LoginPageComponent},
  {path: 'register', component: RegisterPageComponent},
  {path: 'verification', component: VerificationComponent},
  {
    path: 'addwork', component: AddWorkComponent,
    canActivate: [canActivateAuth]
  },
  {
    path: 'book/:bookId', component: BookPageComponent, children: [
      {path: 'chapter/:chapterId', component: ChapterComponent},
      {path: 'chapter', component: ChapterComponent},
    ]
  },
  {path: 'search', component: SearchPageComponent},
];
