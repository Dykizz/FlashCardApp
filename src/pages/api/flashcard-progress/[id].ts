import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { FlashCard, FlashCardSchema } from "@/models/FlashCard";
import { Question, QuestionSchema } from "@/models/Question";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/withAuth";
import { FlashCardDetail } from "@/types/flashCard.type";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  FlashCardProgress,
  FlashCardProgressSchema,
} from "@/models/FlashCardProgress";

const FlashCardModel =
  mongoose.models.FlashCard || mongoose.model("FlashCard", FlashCardSchema);
const QuestionModel =
  mongoose.models.Question || mongoose.model("Question", QuestionSchema);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const identifier = req.user?.userId || "anonymous";

  const { success, headers } = await checkRateLimit(identifier, "api");

  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (!success) {
    return res
      .status(429)
      .json(errorResponse("Quá nhiều yêu cầu. Vui lòng thử lại sau.", 429));
  }

  if (req.method !== "GET") {
    return res.status(405).json(errorResponse("Phương thức không hợp lệ", 405));
  }

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json(errorResponse("ID không hợp lệ", 400));
  }

  try {
    const flashcard: FlashCard = await FlashCardModel.findById(id).populate(
      "questionIds"
    );

    if (!flashcard) {
      return res
        .status(404)
        .json(errorResponse("Không tìm thấy FlashCard", 404));
    }
    const questions = flashcard.questionIds as unknown as Question[];

    const flashcardResponse: FlashCardDetail = {
      _id: flashcard._id.toString(),
      title: flashcard.title,
      description: flashcard.description,
      totalQuestion: flashcard.questionIds.length,
      subject: flashcard.subject,
      peopleLearned: Math.floor(Math.random() * 1000),
      questions: questions.map((q) => ({
        _id: q._id.toString(),
        content: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    };

    return res.status(200).json(successResponse(flashcardResponse));
  } catch (err: any) {
    return res.status(500).json(errorResponse("Lỗi tải ", 500));
  }
}

export default withAuth(handler);
