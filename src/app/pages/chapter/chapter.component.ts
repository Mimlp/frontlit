import { Component, inject, computed, effect, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserService } from '../../data/services/user.service';
import { BookService, CreateChapterDto } from '../../data/services/book.service';
import { ChapterInterface } from '../../data/interfaces/chapter.interface';

@Component({
  selector: 'app-chapter',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chapter.component.html',
  styleUrl: './chapter.component.scss'
})
export class ChapterComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private bookService = inject(BookService);
  private fb = inject(FormBuilder);

  // 📌 форма
  chapterForm = this.fb.group({
    chapterTitle: ['', Validators.required],
    chapterText: ['', Validators.required]
  });

  // 📌 id главы
  chapterId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('chapterId')),
      map(id => id ? +id : null)
    ),
    { initialValue: null }
  );

  // 🔥 берем книгу из store
  book = this.bookService.book$;

  // 🔥 глава
  chapter = signal<ChapterInterface | null>(null);

  editMode = false;

  createMode = computed(() => this.chapterId() === null);

  currentUserIsAuthor = computed(() => {
    const book = this.book();
    if (!book || !book.author) return false;
    return book.userRights.author;
  });

  constructor() {

    // 📥 загрузка главы
    effect(() => {
      const id = this.chapterId();

      if (!id) {
        this.chapter.set(null);
        return;
      }

      this.bookService.getChapter(id).subscribe(chapter => {
        this.chapter.set(chapter);
      });
    });

    // 📝 форма
    effect(() => {
      const chapter = this.chapter();
      if (!chapter) return;

      this.chapterForm.patchValue({
        chapterTitle: chapter.chapterTitle,
        chapterText: chapter.chapterText
      });
    });
  }

  startEdit() {
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
  }

  saveChapter() {
    if (this.chapterForm.invalid) return;

    const chapter = this.chapter();
    if (!chapter) return;

    const { chapterTitle, chapterText } = this.chapterForm.value;
    if (!chapterTitle || !chapterText) return;

    const updated: ChapterInterface = {
      ...chapter,
      chapterTitle,
      chapterText
    };

    this.bookService.updateChapter(updated, chapter.chapterId)
      .subscribe({
        next: (updatedChapter) => {
          this.chapter.set(updatedChapter);
          this.editMode = false;
        },
        error: () => {
          alert('Ошибка при сохранении');
        }
      });
  }

  createChapter() {
    if (this.chapterForm.invalid) return;

    const book = this.book();
    if (!book) return;

    const { chapterTitle, chapterText } = this.chapterForm.value;
    if (!chapterTitle || !chapterText) return;

    const dto: CreateChapterDto = {
      chapterTitle,
      chapterText
    };

    this.bookService.createChapter(book.bookId, dto)
      .subscribe(newChapter => {
        this.router.navigate(['/book', book.bookId, 'chapter', newChapter.chapterId]);
      });
  }

  deleteChapter() {
    const chapter = this.chapter();
    const book = this.book();

    if (!chapter || !book) return;

    this.bookService.deleteChapter(chapter.chapterId)
      .subscribe(() => {
        this.router.navigate(['/book', book.bookId]);
      });
  }
}
