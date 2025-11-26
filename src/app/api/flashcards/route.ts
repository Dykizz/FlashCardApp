import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/response";
import { FlashCardBase } from "@/types/flashCard.type";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCached } from "@/lib/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { FlashCardModel } from "@/models/FlashCard";
import { FlashCardProgressModel } from "@/models/FlashCardProgress";

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
    // const flashcards = await getCached(
    //   "flashcards:all",
    //   async () => {
    //     console.log("🔴 LOG NÀY HIỆN RA => ĐANG LẤY TỪ DATABASE (MISS CACHE)");
    //     return await FlashCardModel.find({}).sort({ createdAt: -1 }).lean();
    //   },
    //   900
    // );
    const flashcards = await FlashCardModel.find({})
      .sort({ createdAt: -1 })
      .lean();

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

    const flashCardBase: FlashCardBase[] = flashcards.map((card) => {
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
