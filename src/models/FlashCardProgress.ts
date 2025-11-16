import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import type { Ref } from "@typegoose/typegoose";
import { FlashCard } from "./FlashCard";
import { User } from "./User";
import mongoose from "mongoose";

@modelOptions({
  schemaOptions: { timestamps: true },
})
export class FlashCardProgress {
  _id!: string;

  @prop({ ref: () => User, required: true })
  userId!: Ref<User>;

  @prop({ ref: () => FlashCard, required: true })
  flashCardId!: Ref<FlashCard>;

  @prop({ default: 0 })
  count!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FlashCardProgressModel =
  mongoose.models.FlashCardProgress || getModelForClass(FlashCardProgress);
