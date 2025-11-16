import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/response";
import { getServerSession } from "next-auth/next";
import { FlashCardDetail } from "@/types/flashCard.type";
import { checkRateLimit } from "@/lib/rateLimit";
import { authOptions } from "@/lib/auth";
import { FlashCardModel } from "@/models/FlashCard";
import { FlashCardProgressModel } from "@/models/FlashCardProgress";

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
    // populate questionIds để lấy chi tiết question
    const flashcard = (await FlashCardModel.findById(id)
      .populate("questionIds")
      .lean()) as FlashCardDetail | null;

    if (!flashcard) {
      return NextResponse.json(errorResponse("Không tìm thấy FlashCard", 404), {
        status: 404,
      });
    }

    // @ts-ignore
    const questions = flashcard.questionIds; // đã populate, không cần cast as any[]

    const peopleLearned = await FlashCardProgressModel.countDocuments({
      flashCardId: flashcard._id,
    });

    const flashcardResponse: FlashCardDetail = {
      _id: flashcard._id.toString(),
      title: flashcard.title,
      description: flashcard.description,
      totalQuestion: questions.length,
      subject: flashcard.subject,
      peopleLearned,
      questions: questions.map((q: any) => ({
        _id: q._id.toString(),
        content: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
    };

    return NextResponse.json(successResponse(flashcardResponse), {
      status: 200,
      headers: Object.fromEntries(Object.entries(headers)),
    });
  } catch (err: any) {
    console.error("[API] Error:", err);
    return NextResponse.json(errorResponse("Lỗi tải flashcard progress", 500), {
      status: 500,
    });
  }
}
