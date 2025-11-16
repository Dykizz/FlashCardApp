import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/response";
import { getServerSession } from "next-auth/next";
import { FlashCardDetail } from "@/types/flashCard.type";
import { checkRateLimit } from "@/lib/rateLimit";
import { authOptions } from "@/lib/auth";
import { getCached } from "@/lib/cache";
import { ObjectId } from "mongodb";

import { FlashCardModel } from "@/models/FlashCard";
import { FlashCardProgressModel } from "@/models/FlashCardProgress";
import { Question } from "@/models/Question";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(errorResponse("Vui lòng đăng nhập", 401), {
      status: 401,
    });
  }

  await dbConnect();
  const identifier = session.user.email;

  const { success, headers } = await checkRateLimit(identifier, "api");

  if (!success) {
    return NextResponse.json(
      errorResponse("Quá nhiều yêu cầu. Vui lòng thử lại sau.", 429),
      { status: 429, headers: Object.fromEntries(Object.entries(headers)) }
    );
  }

  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json(errorResponse("ID không hợp lệ", 400), {
      status: 400,
    });
  }

  try {
    const flashcardData = await getCached(
      `flashcard-detail:${id}`,
      async () => {
        console.log("LOG: Querying Flashcard from DB (Cache Miss)...");

        // populate questionIds để lấy chi tiết question
        const flashcard = await FlashCardModel.findById(id).populate<{
          questionIds: Question[];
        }>("questionIds");

        if (!flashcard) return null;

        const questions = flashcard.questionIds || [];

        const flashcardResponse: Omit<FlashCardDetail, "peopleLearned"> = {
          _id: flashcard._id.toString(),
          title: flashcard.title,
          description: flashcard.description,
          totalQuestion: questions.length,
          subject: flashcard.subject,
          questions: questions.map((q) => ({
            _id: q._id.toString(),
            content: q.content,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        };

        return flashcardResponse;
      },
      3600
    );

    if (!flashcardData) {
      return NextResponse.json(errorResponse("Không tìm thấy FlashCard", 404), {
        status: 404,
      });
    }

    if (session.user.id) {
      await FlashCardProgressModel.findOneAndUpdate(
        { userId: new ObjectId(session.user.id), flashCardId: id },
        {
          $inc: { count: 1 },
          $setOnInsert: {
            userId: new ObjectId(session.user.id),
            flashCardId: new ObjectId(id),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const peopleLearned = await FlashCardProgressModel.countDocuments({
      flashCardId: new ObjectId(flashcardData._id),
    });

    const response: FlashCardDetail = {
      ...flashcardData,
      peopleLearned,
    };

    return NextResponse.json(successResponse(response), {
      status: 200,
      headers: Object.fromEntries(Object.entries(headers)),
    });
  } catch (err: any) {
    console.error("[API] Error:", err);
    return NextResponse.json(errorResponse("Lỗi tải flashcard details", 500), {
      status: 500,
    });
  }
}
