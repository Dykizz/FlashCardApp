import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";
export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class User {
  _id!: string;

  @prop({ required: true, unique: true })
  email!: string;

  @prop({ required: true })
  name!: string;

  @prop()
  image?: string;

  @prop()
  password?: string;

  @prop({
    required: true,
    enum: ["local", "google"],
    default: "local",
  })
  provider!: string;

  @prop({
    required: true,
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @prop({ default: Date.now })
  lastLogin?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserModel = mongoose.models.User || getModelForClass(User);
