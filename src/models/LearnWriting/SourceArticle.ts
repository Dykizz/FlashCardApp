import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import mongoose from "mongoose";

export enum ArticleLevel {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2",
}

class VocabularyHint {
  @prop() public word?: string;
  @prop() public meaning?: string;
  @prop() public type?: string;
}

class StructureHint {
  @prop() public structure?: string;
  @prop() public usage?: string;
}

class Hints {
  @prop({ type: () => [VocabularyHint], default: [] })
  public vocabulary?: VocabularyHint[];

  @prop({ type: () => [StructureHint], default: [] })
  public structures?: StructureHint[];
}

class SourceSentence {
  @prop({ required: true })
  public sentence_id!: number;

  @prop({ required: true })
  public content_vn!: string;

  @prop({ default: 10 })
  public complexity_score?: number;

  @prop({ type: () => [String], default: [] })
  public sample_answers!: string[];

  @prop({ type: () => Hints, default: {}, _id: false })
  public hints?: Hints;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class SourceArticle {
  _id!: string;

  @prop({ required: true })
  public title_vn!: string;

  @prop({ required: true })
  public topic!: string;

  @prop()
  public description?: string;

  @prop({
    required: true,
    enum: ArticleLevel,
    type: () => String,
  })
  public level!: ArticleLevel;

  @prop({
    type: () => [SourceSentence],
    required: true,
    _id: false,
    default: [],
  })
  public source_sentences!: SourceSentence[];

  @prop({ required: true })
  public original_text!: string;
}

export const SourceArticleModel =
  mongoose.models.SourceArticle || getModelForClass(SourceArticle);
