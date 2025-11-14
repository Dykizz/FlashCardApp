import { Schema, model, models, Document, ObjectId } from "mongoose";

export interface FlashCardProgress {
  _id: string | ObjectId;
  userId: string | ObjectId;
  flashCardId: ObjectId;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

export type FlashCardProgressDocument = FlashCardProgress & Document;

export const FlashCardProgressSchema = new Schema<FlashCardProgress>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    flashCardId: {
      type: Schema.Types.ObjectId,
      ref: "FlashCard",
      required: true,
    },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const FlashCardProgressModel =
  models.FlashCardProgress ||
  model<FlashCardProgress>("FlashCardProgress", FlashCardProgressSchema);
