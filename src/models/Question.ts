import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { ObjectId } from "mongoose";
import { Document, SchemaTypes } from "mongoose";

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {
  _id!: string | ObjectId;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: false })
  explanation?: string;

  @Prop({ type: [String], required: true })
  options!: string[];

  @Prop({ required: true })
  correctAnswer!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
