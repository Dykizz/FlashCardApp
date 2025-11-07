import type { NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth, NextApiRequestWithUser } from "@/lib/withAuth";
import { FlashCardDetail, FlashCardProgress } from "@/types/flashCard.type";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCached } from "@/lib/cache";
import { FlashCardSchema } from "@/models/FlashCard";
import { FlashCardProgressSchema } from "@/models/FlashCardProgress";
import { QuestionSchema } from "@/models/Question"; // ⭐ Import QuestionSchema

interface FlashCardDocument {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  subject: string;
  totalQuestion?: number;
  peopleLearned?: number;
  questionIds: Array<{
    _id: mongoose.Types.ObjectId;
    content: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  await dbConnect();

  const identifier = req.user.userId;

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
    // ⭐ Register models
    const FlashCardModel =
      mongoose.models.FlashCard || mongoose.model("FlashCard", FlashCardSchema);

    const FlashCardProgressModel =
      mongoose.models.FlashCardProgress ||
      mongoose.model("FlashCardProgress", FlashCardProgressSchema);

    const QuestionModel =
      mongoose.models.Question || mongoose.model("Question", QuestionSchema); // ⭐ Register Question model

    const flashcard = await getCached<FlashCardDocument | null>(
      `flashcards:${id}`,
      async () => {
        const data = await FlashCardModel.findById(id)
          .populate("questionIds")
          .lean<FlashCardDocument>();

        return data;
      },
      900
    );

    if (!flashcard) {
      return res
        .status(404)
        .json(errorResponse("Không tìm thấy FlashCard", 404));
    }

    const questions = flashcard.questionIds;

    let flashcardProgress = await FlashCardProgressModel.findOne({
      flashCardId: flashcard._id,
      userId: req.user.userId,
    });

    if (!flashcardProgress) {
      flashcardProgress = await FlashCardProgressModel.create({
        flashCardId: flashcard._id,
        userId: req.user.userId,
        progress: questions.map((q) => ({
          questionId: q._id.toString(),
          weight: 0,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const progress: FlashCardProgress = flashcardProgress.toObject();

    const flashcardResponse: FlashCardDetail = {
      _id: flashcard._id.toString(),
      title: flashcard.title,
      description: flashcard.description,
      totalQuestion: questions.length,
      subject: flashcard.subject,
      peopleLearned: flashcard.peopleLearned || 0,
      questions: questions.map((q) => ({
        _id: q._id.toString(),
        content: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    };

    return res.status(200).json(
      successResponse({
        flashcard: flashcardResponse,
        progress,
      })
    );
  } catch (err: any) {
    console.error("[API] Error:", err);
    return res.status(500).json(errorResponse("Lỗi tải flashcard", 500));
  }
}

export default withAuth(handler);
