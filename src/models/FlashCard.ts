import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, SchemaTypes } from "mongoose";

export type FlashCardDocument = FlashCard & Document;

@Schema({ timestamps: true })
export class FlashCard {
  _id!: string | ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({
    required: false,
    type: [SchemaTypes.ObjectId],
    ref: "Question",
    default: [],
  })
  questionIds!: ObjectId[];

  @Prop({ required: true })
  subject!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const FlashCardSchema = SchemaFactory.createForClass(FlashCard);
