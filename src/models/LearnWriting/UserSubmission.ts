import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import type { Ref } from "@typegoose/typegoose";
import { User } from "../User";
import { SourceArticle } from "./SourceArticle";
import mongoose from "mongoose";

export enum AIFeedbackErrorType {
  Grammar = "Grammar",
  Vocabulary = "Vocabulary",
  Spelling = "Spelling",
  Punctuation = "Punctuation",
  Style = "Style",
  Meaning = "Meaning",
  Other = "Other",
}

class AIFeedback {
  @prop({
    enum: AIFeedbackErrorType,
    type: () => String,
  })
  public error_type?: AIFeedbackErrorType;

  @prop()
  public correction_tip?: string;

  @prop()
  public suggested_improvement?: string;
}

class SentenceDetail {
  @prop({ required: true })
  public sentence_id!: number;

  @prop({ required: true })
  public user_answer!: string;

  @prop({ required: true })
  public score!: number;

  @prop({ type: () => AIFeedback, _id: false })
  public ai_feedback?: AIFeedback;
}

class AISummaryReview {
  @prop()
  public weakness?: string; // (Chúng ta sẽ bàn về trường này sau)

  @prop()
  public suggestion?: string;

  @prop({ type: () => [String], default: [] })
  public new_vocab!: string[];
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class UserSubmission {
  @prop({ ref: () => User, required: true, index: true })
  public user_id!: Ref<User>;

  @prop({ ref: () => SourceArticle, required: true })
  public article_id!: Ref<SourceArticle>;

  @prop({ required: true, default: 0 })
  public overall_score!: number;

  @prop({ type: () => AISummaryReview, _id: false })
  public ai_summary_review?: AISummaryReview;

  @prop({ type: () => [SentenceDetail], _id: false, required: true })
  public sentence_details!: SentenceDetail[];
}

export const UserSubmissionModel =
  mongoose.models.UserSubmission || getModelForClass(UserSubmission);
