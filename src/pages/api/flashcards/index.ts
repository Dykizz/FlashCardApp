import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { FlashCardSchema } from "@/models/FlashCard";
import { successResponse, errorResponse } from "@/lib/response";
import { withAuth } from "@/lib/withAuth";
import { FlashCardBase } from "@/types/flashCard.type";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCached } from "@/lib/cache";
import { FlashCardProgressSchema } from "@/models/FlashCardProgress";

const FlashCard =
  mongoose.models.FlashCard || mongoose.model("FlashCard", FlashCardSchema);

const FlashCardProgressModel =
  mongoose.models.FlashCardProgress ||
  mongoose.model("FlashCardProgress", FlashCardProgressSchema);

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
    return res.status(405).json(errorResponse("Method not allowed", 405));
  }

  try {
    const flashcards = await getCached(
      "flashcards:all",
      async () => {
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

    const flashCardBase: FlashCardBase[] = flashcards.map((card) => ({
      _id: card._id.toString(),
      title: card.title,
      description: card.description,
      totalQuestion: card.questionIds.length,
      subject: card.subject,
      peopleLearned: countMap.get(card._id.toString()) || 0, // ⭐ Real count or 0
    }));

    return res.status(200).json(successResponse(flashCardBase));
  } catch (err: any) {
    console.error("Error fetching flashcards:", err);
    return res
      .status(500)
      .json(errorResponse("Failed to fetch flashcards", 500));
  }
}

export default withAuth(handler);
