import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
  index,
} from "@typegoose/typegoose";
import mongoose from "mongoose";
import { User } from "./User";
import type { Ref } from "@typegoose/typegoose";
import { PostStatus } from "@/types/post";

@index({ slug: 1 }, { unique: true })
@index({ status: 1, publishedAt: -1 })
@modelOptions({
  schemaOptions: {
    collection: "posts",
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Post {
  @prop({ required: true, trim: true })
  public title: string;

  @prop({ required: true, trim: true })
  public slug: string;

  @prop({ trim: true })
  public description?: string;

  @prop()
  public thumbnail?: string;

  @prop({ required: true })
  public content: object;

  @prop({
    enum: Object.values(PostStatus),
    default: PostStatus.DRAFT,
    type: String,
  })
  public status: PostStatus;

  @prop({ ref: () => User, required: true })
  public author: Ref<User>;

  @prop({ type: () => [String], default: [], index: true })
  public tags: string[];

  @prop({ default: 0 })
  public readingTime?: number;

  @prop({ default: 0 })
  public views: number;

  @prop()
  public publishedAt?: Date;
}

export const PostModel = mongoose.models.Post || getModelForClass(Post);
