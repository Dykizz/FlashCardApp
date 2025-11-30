import {
  prop,
  getModelForClass,
  modelOptions,
  Severity,
  index,
} from "@typegoose/typegoose";
import type { Ref } from "@typegoose/typegoose/lib/types";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { User } from "./User";
import { ObjectId } from "mongodb";

export enum FileStatus {
  TEMP = "temp",
  ACTIVE = "active",
}

@index({ status: 1, createdAt: 1 })
@modelOptions({
  schemaOptions: {
    collection: "files",
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class File extends TimeStamps {
  @prop({ required: true })
  public url: string;

  @prop({ required: true })
  public publicId: string;

  @prop({ default: "image" })
  public type?: string;

  @prop()
  public size?: number;

  @prop()
  public mimeType?: string;

  @prop({ enum: FileStatus, default: FileStatus.TEMP })
  public status: FileStatus;

  @prop({ ref: () => User, type: ObjectId })
  public userId?: Ref<User>;
}

export const FileModel = getModelForClass(File);
