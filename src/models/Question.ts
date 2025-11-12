import { Schema, model, models, Document, ObjectId } from "mongoose";

export interface Question {
  _id: string | ObjectId;
  content: string;
  explanation?: string;
  options: string[];
  correctAnswer: number;
  createdAt: Date;
  updatedAt: Date;
}

export type QuestionDocument = Question & Document;

export const QuestionSchema = new Schema<Question>(
  {
    content: { type: String, required: true },
    explanation: { type: String, required: false },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
  },
  { timestamps: true }
);

export const QuestionModel =
  models.Question || model<Question>("Question", QuestionSchema);
