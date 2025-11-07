import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, SchemaTypes } from "mongoose";
import type { ObjectId } from "mongoose";

export type FlashCardProgressDocument = FlashCardProgress & Document;

@Schema({ _id: false })
export class ProgressItem {
  @Prop({ required: true })
  questionId!: string;

  @Prop({ default: 0 })
  weight!: number;
}

const ProgressItemSchema = SchemaFactory.createForClass(ProgressItem);

@Schema({ timestamps: true })
export class FlashCardProgress {
  _id!: string | ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", required: true })
  userId!: ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "FlashCard", required: true })
  flashCardId!: ObjectId;

  @Prop({ type: [ProgressItemSchema], default: [] })
  progress!: ProgressItem[];

  createdAt!: Date;
  updatedAt!: Date;
}

export const FlashCardProgressSchema =
  SchemaFactory.createForClass(FlashCardProgress);
