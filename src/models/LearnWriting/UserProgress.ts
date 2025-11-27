import {
  prop,
  getModelForClass,
  modelOptions,
  index,
} from "@typegoose/typegoose";
import mongoose from "mongoose";
import { User } from "@/models/User";
import { SourceArticle } from "./SourceArticle";
import type { Ref } from "@typegoose/typegoose";

class Correction {
  @prop()
  public type?: string;

  @prop()
  public text?: string;
}

class AIFeedbackData {
  @prop()
  public score?: number;

  @prop()
  public overall_comment?: string;

  @prop()
  public model_improvement?: string;

  @prop()
  public highlighted_sentence?: string;

  @prop({ type: () => [Correction], default: [] })
  public corrections?: Correction[];
}

class SentenceResult {
  @prop({ required: true })
  public sentence_id!: number;

  @prop({ required: true })
  public original_vn!: string;

  @prop({ required: true })
  public user_submission!: string;

  @prop({ required: true })
  public score!: number;

  @prop({ default: 1 })
  public attempts!: number;

  @prop({ type: () => AIFeedbackData, _id: false })
  public ai_feedback!: AIFeedbackData;

  @prop({ default: Date.now })
  public completedAt!: Date;
}

class OverallEvaluation {
  @prop()
  public final_score?: number;

  @prop()
  public summary_comment?: string;

  @prop({ type: () => [String] })
  public strengths?: string[];

  @prop({ type: () => [String] })
  public weaknesses?: string[];

  @prop()
  public study_plan?: string;

  @prop()
  public rank?: string;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "userProgress",
  },
})
@index({ userId: 1, articleId: 1 }, { unique: true })
export class UserProgress {
  _id!: string;

  @prop({ ref: () => User, required: true })
  public userId!: Ref<User>;

  @prop({ ref: () => SourceArticle, required: true })
  public articleId!: Ref<SourceArticle>;

  @prop({ default: 0 })
  public current_step!: number;

  @prop({ default: false })
  public is_completed!: boolean;

  @prop({ default: 0 })
  public average_score!: number;

  @prop({ type: () => [SentenceResult], default: [] })
  public history!: SentenceResult[];

  @prop({ type: () => OverallEvaluation, _id: false })
  public overall_evaluation?: OverallEvaluation;
}

export const UserProgressModel =
  mongoose.models.UserProgress || getModelForClass(UserProgress);
