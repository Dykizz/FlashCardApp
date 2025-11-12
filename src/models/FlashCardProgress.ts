import { Schema, model, models, Document, ObjectId } from "mongoose";

export interface ProgressItem {
  questionId: string;
  weight: number;
}

export interface FlashCardProgress {
  _id: string | ObjectId;
  userId: string;
  flashCardId: ObjectId;
  progress: ProgressItem[];
  createdAt: Date;
  updatedAt: Date;
}

export type FlashCardProgressDocument = FlashCardProgress & Document;

const ProgressItemSchema = new Schema<ProgressItem>(
  {
    questionId: { type: String, required: true },
    weight: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

export const FlashCardProgressSchema = new Schema<FlashCardProgress>(
  {
    userId: { type: String, required: true },
    flashCardId: {
      type: Schema.Types.ObjectId,
      ref: "FlashCard",
      required: true,
    },
    progress: {
      type: [ProgressItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const FlashCardProgressModel =
  models.FlashCardProgress ||
  model<FlashCardProgress>("FlashCardProgress", FlashCardProgressSchema);
