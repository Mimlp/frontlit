export interface CommentInterface {
  commentId: number;

  commentText: string;
  commentDate?: string;

  bookId: number;
  userId: number;
}
