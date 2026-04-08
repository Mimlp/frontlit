export interface UserInterface {
  userId: number;

  login: string;
  username: string;
  email: string;
  profileDescription?: string;
  registrationDate?: string;

  isEnabled: boolean;
  roles?: string;
}
