import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/response";
import { UserProgressModel } from "@/models/LearnWriting/UserProgress";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(errorResponse("Unauthorized", 401), {
        status: 401,
      });
    }

    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(errorResponse("Thiếu articleId", 400), {
        status: 400,
      });
    }

    await dbConnect();

    const progress = await UserProgressModel.findOne({
      userId: session.user.id,
      articleId: articleId,
    }).lean();

    return NextResponse.json(successResponse(progress), { status: 200 });
  } catch (error: any) {
    return NextResponse.json(errorResponse(error.message, 500), {
      status: 500,
    });
  }
}
