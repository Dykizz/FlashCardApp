import { Schema, model, models, Document, ObjectId } from "mongoose";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface User {
  _id: string | ObjectId;
  email: string;
  name: string;
  image?: string;
  password?: string;
  provider: string;
  role: UserRole;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = User & Document;

export const UserSchema = new Schema<User>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String },
    password: { type: String },
    provider: {
      type: String,
      required: true,
      enum: ["local", "google"],
      default: "local",
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const UserModel = models.User || model<User>("User", UserSchema);
