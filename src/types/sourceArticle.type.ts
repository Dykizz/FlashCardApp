export enum ArticleLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

export enum WordType {
  // Các từ loại cơ bản (Basic Parts of Speech)
  NOUN = "n", // Danh từ
  VERB = "v", // Động từ
  ADJECTIVE = "adj", // Tính từ
  ADVERB = "adv", // Trạng từ
  PRONOUN = "pron", // Đại từ
  PREPOSITION = "prep", // Giới từ
  CONJUNCTION = "conj", // Liên từ
  DETERMINER = "det", // Hạn định từ (a, an, the, this...)

  // Các cấu trúc từ vựng quan trọng cho TOEIC/IELTS
  PHRASAL_VERB = "phr_v", // Cụm động từ (look after, give up)
  IDIOM = "idiom", // Thành ngữ (break a leg)
  COLLOCATION = "colloc", // Các từ hay đi chung (heavy rain, deep sleep)
  PHRASE = "phrase", // Cụm từ thông thường khác
  PREFIX = "prefix", // Tiền tố
  SUFFIX = "suffix", // Hậu tố
}
interface VocabularyHint {
  word: string;
  meaning: string;
  type: WordType;
}

interface StructureHint {
  structure: string;
  usage: string;
}

export interface Hints {
  vocabulary: VocabularyHint[];
  structures?: StructureHint[];
}

export interface SourceSentence {
  sentence_id?: number;
  content_vn: string;
  complexity_score: number;
  sample_answers: string[];
  hints?: Hints;
}

export interface SourceSentenceLearn
  extends Omit<SourceSentence, "sample_answers"> {}

export interface SourceArticle {
  _id: string;
  title_vn: string;
  topic: string;
  level: ArticleLevel;
  source_sentences: SourceSentence[];
  original_text: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SourceArticleLearn
  extends Omit<SourceArticle, "source_sentences"> {
  source_sentences: SourceSentenceLearn[];
}

export interface CreateSourceArticle extends Omit<SourceArticle, "_id"> {}

// Cấu trúc trả về khi AI chấm
export interface Correction {
  type: string;
  text: string;
}

export interface GradingSentence {
  score: number;
  overall_comment: string;
  corrections: Correction[];
  model_improvement: string;
  highlighted_sentence?: string;
}

export interface OverallEvaluation {
  final_score: number;
  summary_comment: string;
  strengths: string[];
  weaknesses: string[];
  study_plan: string;
  rank: string;
}

export interface SentenceResult {
  sentence_id: number;
  original_vn: string;
  user_submission: string;
  score: number;
  attempts: number;
  ai_feedback: GradingSentence;
  completedAt: string;
}

export interface UserProgress {
  _id: string;
  userId: string;
  articleId: string;

  current_step: number;
  is_completed: boolean;
  average_score: number;

  history: SentenceResult[];
  overall_evaluation?: OverallEvaluation;

  createdAt: string;
  updatedAt: string;
}
