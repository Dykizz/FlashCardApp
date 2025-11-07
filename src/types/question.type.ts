export interface Question {
  _id: string;
  content: string;
  explanation?: string;
  options: string[];
  correctAnswer: number;
}
