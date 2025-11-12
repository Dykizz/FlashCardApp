import { Question } from "./question.type";

export interface FlashCardBase {
  _id: string;
  title: string;
  description?: string;
  totalQuestion: number;
  peopleLearned: number;
  subject: string;
}

export interface FlashCardDetail extends FlashCardBase {
  questions: Question[];
}

export interface FlashCardProgress {
  _id: string;
  userId: string;
  flashCardId: string;
  createdAt: Date;
  updatedAt: Date;
}
