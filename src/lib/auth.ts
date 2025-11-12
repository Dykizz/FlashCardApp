import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { UserSchema, UserRole } from "@/models/User";

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await dbConnect();

        if (!user.email) return false;

        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            email: user.email,
            name: user.name || "",
            image: user.image || "",
            provider: "google",
            role: UserRole.USER,
            lastLogin: new Date(),
          });
        } else {
          await User.findOneAndUpdate(
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
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        await dbConnect();

        const dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
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
      }
      return session;
    },
  },
};
