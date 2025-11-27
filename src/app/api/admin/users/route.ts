import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/response";
import { UserModel } from "@/models/User";
import { FilterQuery } from "mongoose";
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
    const role = searchParams.get("role") || "all";

    const filter: FilterQuery<typeof UserModel> = {};

    filter._id = { $ne: session.user.id };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      filter.role = role;
    }

    const skip = (page - 1) * limit;

    const [users, totalDocs] = await Promise.all([
      UserModel.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return NextResponse.json(
      successResponse(users, {
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
    console.error("Users API Error:", error);
    return NextResponse.json(errorResponse("Lỗi server", 500), { status: 500 });
  }
}
