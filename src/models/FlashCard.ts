import { Schema, model, models, Document, ObjectId } from "mongoose";

export interface FlashCard {
  _id: string | ObjectId;
  title: string;
  description: string;
  questionIds: ObjectId[];
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FlashCardDocument = FlashCard & Document;

export const FlashCardSchema = new Schema<FlashCard>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    questionIds: {
      type: [Schema.Types.ObjectId],
      ref: "Question",
      default: [],
    },
    subject: { type: String, required: true },
  },
  { timestamps: true }
);

export const FlashCardModel =
  models.FlashCard || model<FlashCard>("FlashCard", FlashCardSchema);
