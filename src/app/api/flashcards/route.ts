import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { FlashCardSchema } from "@/models/FlashCard";
import { successResponse, errorResponse } from "@/lib/response";
import { FlashCardBase } from "@/types/flashCard.type";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCached } from "@/lib/cache";
import { FlashCardProgressSchema } from "@/models/FlashCardProgress";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const FlashCard =
  mongoose.models.FlashCard || mongoose.model("FlashCard", FlashCardSchema);

const FlashCardProgressModel =
  mongoose.models.FlashCardProgress ||
  mongoose.model("FlashCardProgress", FlashCardProgressSchema);

export async function GET(req: NextRequest) {
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

  try {
    const flashcards = await getCached(
      "flashcards:all",
      async () => {
        console.log("🔴 LOG NÀY HIỆN RA => ĐANG LẤY TỪ DATABASE (MISS CACHE)");
        return await FlashCard.find({}).sort({ createdAt: -1 }).lean();
      },
      900
    );

    const progressCounts = await FlashCardProgressModel.aggregate([
      {
        $group: {
          _id: "$flashCardId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map<string, number>();
    progressCounts.forEach((item) => {
      countMap.set(item._id.toString(), item.count);
    });

    const flashCardBase: FlashCardBase[] = flashcards.map((card: any) => {
      const idStr = String(card._id);
      return {
        _id: idStr,
        title: card.title,
        description: card.description,
        totalQuestion: Array.isArray(card.questionIds)
          ? card.questionIds.length
          : 0,
        subject: card.subject,
        peopleLearned: countMap.get(idStr) || 0,
      };
    });

    return NextResponse.json(successResponse(flashCardBase), {
      status: 200,
      headers: Object.fromEntries(Object.entries(headers)),
    });
  } catch (err: any) {
    console.error("Error fetching flashcards:", err);
    return NextResponse.json(errorResponse("Failed to fetch flashcards", 500), {
      status: 500,
    });
  }
}
