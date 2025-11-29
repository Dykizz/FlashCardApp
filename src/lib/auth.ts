import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { UserRole } from "@/types/user.type";
import { signOut } from "next-auth/react";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl + "/api")) {
        return baseUrl;
      }

      return url;
    },
    async signIn({ user }) {
      try {
        await dbConnect();
        if (!user.email) return false;

        const existingUser = await UserModel.findOne({ email: user.email });

        if (existingUser && existingUser.isBanned) {
          return "/login?error=banned";
        }

        if (!existingUser) {
          await UserModel.create({
            email: user.email,
            name: user.name || "",
            image: user.image || "",
            provider: "google",
            role: UserRole.USER,
            lastLogin: new Date(),
            isBanned: false,
          });
        } else {
          await UserModel.findOneAndUpdate(
            { email: user.email },
            {
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
              lastLogin: new Date(),
            }
          );
        }
        return true;
      } catch (error) {
        console.error("❌ Error in signIn callback:", error);
        return "/login?error=server_error";
      }
    },

    async jwt({ token, user }) {
      if (user) {
        await dbConnect();
        const dbUser = await UserModel.findOne({ email: user.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
          token.isBanned = dbUser.isBanned;
          token.role = dbUser.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as UserRole;

        session.user.isBanned = false;

        try {
          await dbConnect();
          const freshUser = await UserModel.findById(token.id).select(
            "isBanned role image name"
          );

          if (freshUser) {
            session.user.role = freshUser.role;
            session.user.image = freshUser.image;
            session.user.name = freshUser.name;

            if (freshUser.isBanned) {
              session.user.isBanned = true;
            }
          } else {
            await signOut({ callbackUrl: "/login?error=unknown" });
            return session;
          }
        } catch (error) {
          console.error("Error fetching fresh user data:", error);
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};
