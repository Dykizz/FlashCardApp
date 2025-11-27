import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { errorResponse, successResponse } from "@/lib/response";
import { UserProgressModel } from "@/models/LearnWriting/UserProgress";
import { evaluateOverallPerformance } from "@/lib/ai-service";
import { z } from "zod";

const BodySchema = z.object({
  articleId: z.string().min(1, "Thiếu Article ID"),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(errorResponse("Vui lòng đăng nhập", 401), {
        status: 401,
      });
    }

    await dbConnect();
    const body = await req.json();

    // 2. Validate Body
    const parse = BodySchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(errorResponse("Dữ liệu không hợp lệ", 400));
    }

    const { articleId } = parse.data;

    // 3. Lấy dữ liệu bài làm
    const progress = await UserProgressModel.findOne({
      userId: session.user.id,
      articleId: articleId,
    });

    // Kiểm tra xem user đã làm bài chưa
    if (!progress || !progress.history || progress.history.length === 0) {
      return NextResponse.json(
        errorResponse(
          "Chưa có dữ liệu bài làm để đánh giá. Hãy hoàn thành bài tập trước.",
          400
        ),
        { status: 400 }
      );
    }

    // 4. Chuẩn bị dữ liệu gửi cho AI (Lọc bớt trường thừa để tiết kiệm token)
    const historyForAI = progress.history.map((h: any) => ({
      vn: h.original_vn,
      en: h.user_submission,
      score: h.score,
    }));

    console.log("🤖 Đang gọi AI đánh giá tổng quan...");
    const evaluation = await evaluateOverallPerformance(historyForAI, "gemini");

    // 5. Lưu vào DB
    // QUAN TRỌNG: Đảm bảo UserProgressModel đã có field 'overall_evaluation'
    progress.overall_evaluation = evaluation;
    progress.is_completed = true;

    // Dùng markModified nếu Mongoose không tự nhận diện thay đổi trong Object hỗn hợp
    progress.markModified("overall_evaluation");
    await progress.save();

    console.log("✅ Đã lưu đánh giá vào DB.");

    return NextResponse.json(successResponse(evaluation), { status: 200 });
  } catch (error: any) {
    console.error("Eval API Error:", error);
    return NextResponse.json(
      errorResponse(error.message || "Lỗi server", 500),
      { status: 500 }
    );
  }
}
