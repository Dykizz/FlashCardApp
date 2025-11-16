import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";
import type { Ref } from "@typegoose/typegoose";
import { Question } from "./Question";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class FlashCard {
  _id!: string;
  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  description!: string;

  @prop({ ref: () => Question, type: () => [String], default: [] })
  questionIds!: Ref<Question>[];

  @prop({ required: true })
  subject!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FlashCardModel = getModelForClass(FlashCard);
