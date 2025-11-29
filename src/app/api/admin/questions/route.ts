import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/response";
import { QuestionModel } from "@/models/Question";
import { FilterQuery, SortOrder } from "mongoose";
import { UserRole } from "@/types/user.type";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(errorResponse("Unauthorized", 403), {
        status: 403,
      });
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const sortOption: Record<string, SortOrder> = {};

    const filter: FilterQuery<typeof QuestionModel> = {};

    if (sort) {
      sortOption[sort] = order === "asc" ? 1 : -1;
    } else {
      sortOption.createdAt = -1;
    }
    console.log("Sorting by:", sortOption);

    if (search) {
      filter.content = { $regex: search, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [questions, totalDocs] = await Promise.all([
      QuestionModel.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      QuestionModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return NextResponse.json(
      successResponse(questions, {
        page,
        limit,
        totalDocs,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Questions API Error:", error);
    return NextResponse.json(errorResponse("Lỗi server", 500), { status: 500 });
  }
}
