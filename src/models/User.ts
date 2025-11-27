import { UserRole } from "@/types/user.type";
import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "users",
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
    enum: Object.values(UserRole),
    default: UserRole.USER,
    type: String,
  })
  role!: UserRole;

  @prop({ default: false })
  isBanned: boolean;

  @prop({ default: Date.now })
  lastLogin?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserModel = mongoose.models.User || getModelForClass(User);
