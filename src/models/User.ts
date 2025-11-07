import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId } from "mongoose";

export type UserDocument = User & Document;

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Schema({ timestamps: true })
export class User {
  _id!: string | ObjectId;

  @Prop({ required: true })
  displayName!: string;

  @Prop({
    required: true,
    unique: true,
    match: /^[a-z0-9_-]+$/,
  })
  username!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({
    required: true,
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Prop({ required: false })
  refreshToken?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ username: 1 }, { unique: true });
