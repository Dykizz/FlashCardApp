export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface IUser {
  userId: string;
  username: string;
  displayName: string;
  role: UserRole;
}
