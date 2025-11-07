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

export interface ProgressItem {
  questionId: string;
  weight: number;
}

export interface FlashCardProgress {
  _id: string;
  userId: string;
  flashCardId: string;
  progress: ProgressItem[];
  createdAt: Date;
  updatedAt: Date;
}
