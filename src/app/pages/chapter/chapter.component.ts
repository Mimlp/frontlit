// chapter.component.ts
import {Component, inject, computed, effect, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs/operators';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';

import {UserService} from '../../data/services/user.service';
import {BookService, CreateChapterDto} from '../../data/services/book.service';
import {ChapterInterface} from '../../data/interfaces/chapter.interface';

@Component({
  selector: 'app-chapter',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './chapter.component.html',
  styleUrl: './chapter.component.scss'
})
export class ChapterComponent {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private fb = inject(FormBuilder);

  chapterForm = this.fb.group({
    chapterTitle: ['', Validators.required],
    chapterText: ['', Validators.required]
  });

  chapterId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('chapterId')),
      map(id => id ? +id : null)
    ),
    {initialValue: null}
  );

  book = this.bookService.book;

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
    effect(() => {
      const id = this.chapterId();

      if (!id) {
        this.chapter.set(null);
        this.editMode = false;
        this.chapterForm.reset();
        return;
      }

      this.bookService.getChapter(id).subscribe({
        next: (chapter) => {
          this.chapter.set(chapter);
          this.editMode = false;

          this.chapterForm.patchValue({
            chapterTitle: chapter.chapterTitle,
            chapterText: chapter.chapterText
          });
        },
        error: (err) => {
          console.error('Ошибка загрузки главы:', err);
          this.chapter.set(null);
        }
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

    const {chapterTitle, chapterText} = this.chapterForm.value;
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

          const currentBook = this.bookService.book();
          if (currentBook?.chapters) {
            const updatedChapters = currentBook.chapters.map(ch =>
              ch.chapterId === updatedChapter.chapterId ? updatedChapter : ch
            );
            this.bookService.book.set({
              ...currentBook,
              chapters: updatedChapters
            });
          }
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

    const {chapterTitle, chapterText} = this.chapterForm.value;
    if (!chapterTitle || !chapterText) return;

    const dto: CreateChapterDto = { chapterTitle, chapterText };

    this.bookService.createChapter(book.bookId, dto)
      .subscribe(newChapter => {
        const currentBook = this.bookService.book();

        this.router.navigate(['/book', book.bookId, 'chapter', newChapter.chapterId]);
      });
  }


  deleteChapter() {
    const chapter = this.chapter();
    const book = this.book();

    if (!chapter || !book) return;

    this.bookService.deleteChapter(chapter.chapterId)
      .subscribe(() => {
        const currentBook = this.bookService.book();
        if (currentBook?.chapters) {
          const updatedChapters = currentBook.chapters.filter(
            ch => ch.chapterId !== chapter.chapterId
          );
          this.bookService.book.set({
            ...currentBook,
            chapters: updatedChapters
          });
        }

        this.router.navigate(['/book', book.bookId]);
      });
  }
}
