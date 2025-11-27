import { UserRole } from "@/types/user.type";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isBanned: boolean;
      name: string;
      email: string;
      image: string;
      role: UserRole;
    };
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
