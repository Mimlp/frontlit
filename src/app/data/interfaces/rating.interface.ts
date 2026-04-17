export interface RatingInterface {
  ratingId: number;
  rating: number;
  authorDto: AuthorInterface;
}
interface AuthorInterface {
  userId: number;
  username: string;
  profileDescription: string;
}
