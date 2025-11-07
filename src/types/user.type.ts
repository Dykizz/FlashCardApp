import { UserRole } from "@/models/User";

export interface IUser {
  userId: string;
  username: string;
  displayName: string;
  role: UserRole;
}
