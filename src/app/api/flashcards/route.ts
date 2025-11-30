import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/response";
import { FlashCardBase } from "@/types/flashCard.type";
import { checkRateLimit } from "@/lib/rateLimit";
import { FilterQuery, SortOrder } from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { FlashCardModel } from "@/models/FlashCard";
import { FlashCardProgressModel } from "@/models/FlashCardProgress";
import { getCached } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(errorResponse("Vui lòng đăng nhập", 401), {
      status: 401,
    });
  }

  if (session.user.isBanned) {
    return NextResponse.json(
      errorResponse("Tài khoản của bạn đã bị khóa", 403),
      { status: 403 }
    );
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
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // ⭐ Cache key bao gồm tất cả params
    const cacheKey = `flashcards:${page}-${limit}-${search}-${sort}-${order}`;

    const result = await getCached(
      cacheKey,
      async () => {
        console.log(`LOG: Querying Flashcards from DB (Cache Miss)...`);

        const sortOption: Record<string, SortOrder> = {};
        if (sort) {
          sortOption[sort] = order === "asc" ? 1 : -1;
        } else {
          sortOption.createdAt = -1;
        }

        const filter: FilterQuery<typeof FlashCardModel> = {};
        if (search) {
          filter.title = { $regex: search, $options: "i" };
        }

        const skip = (page - 1) * limit;

        const [flashcards, totalDocs] = await Promise.all([
          FlashCardModel.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean(),
          FlashCardModel.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalDocs / limit);

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
          if (!item || item._id == null) return;
          const key =
            typeof item._id === "object" &&
            typeof item._id.toString === "function"
              ? item._id.toString()
              : String(item._id);

          countMap.set(key, Number(item.count || 0));
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

        return {
          data: flashCardBase,
          pagination: {
            page,
            limit,
            totalDocs,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        };
      },
      900
    );

    return NextResponse.json(successResponse(result.data, result.pagination), {
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
