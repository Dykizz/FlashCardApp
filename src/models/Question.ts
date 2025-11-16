import { getModelForClass, prop, modelOptions } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class Question {
  _id!: string;
  @prop({ required: true })
  content!: string;

  @prop()
  explanation?: string;

  @prop({ type: () => [String], required: true })
  options!: string[];

  @prop({ required: true })
  correctAnswer!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const QuestionModel = getModelForClass(Question);
