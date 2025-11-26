import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import type { Ref } from "@typegoose/typegoose";
import { Question } from "./Question";
import mongoose from "mongoose";
@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "flashcards",
  },
})
export class FlashCard {
  _id!: string;
  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  description!: string;

  @prop({ ref: () => Question, default: [] })
  questionIds!: Ref<Question>[];

  @prop({ required: true })
  subject!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FlashCardModel =
  mongoose.models.FlashCard || getModelForClass(FlashCard);
