import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { errorResponse, successResponse } from "@/lib/response";
import { gradeSentence } from "@/lib/ai-service";
import { z } from "zod";
import { ArticleLevel } from "@/types/sourceArticle.type";
import { UserProgressModel } from "@/models/LearnWriting/UserProgress";

const CheckSentenceSchema = z.object({
  articleId: z.string().min(1),
  sentenceId: z.number().min(1),
  totalSentences: z.number().min(1).optional(), // <-- Thêm trường này (Optional để tương thích ngược)
  vnSentence: z.string().min(1),
  enSubmission: z.string().min(1),
  level: z.nativeEnum(ArticleLevel).default(ArticleLevel.B1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(errorResponse("Vui lòng đăng nhập", 401), {
        status: 401,
      });
    }
    const userId = session.user.id;

    await dbConnect();

    const body = await req.json();
    const validationResult = CheckSentenceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          ...errorResponse("Dữ liệu lỗi", 400),
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      articleId,
      sentenceId,
      vnSentence,
      enSubmission,
      level,
      totalSentences,
    } = validationResult.data;

    console.log("🚀 Bắt đầu chấm điểm và tìm DB song song...");

    const [aiFeedback, progressData] = await Promise.all([
      gradeSentence(vnSentence, enSubmission, level, "gemini"),
      UserProgressModel.findOne({ userId, articleId }),
    ]);

    try {
      let progress = progressData;

      if (!progress) {
        progress = new UserProgressModel({
          userId,
          articleId,
          history: [],
          current_step: 0,
          is_completed: false,
          average_score: 0,
        });
      }

      const newResult = {
        sentence_id: sentenceId,
        original_vn: vnSentence,
        user_submission: enSubmission,
        score: aiFeedback.score,
        ai_feedback: aiFeedback,
        completedAt: new Date(),
        attempts: 1,
      };

      const existingIndex = progress.history.findIndex(
        (item: any) => item.sentence_id === sentenceId
      );

      if (existingIndex > -1) {
        const oldAttempts = progress.history[existingIndex].attempts || 1;
        progress.history[existingIndex] = {
          ...newResult,
          attempts: oldAttempts + 1,
        };
      } else {
        progress.history.push(newResult);
      }

      progress.current_step = Math.max(progress.current_step, sentenceId);

      if (progress.history.length > 0) {
        const totalScore = progress.history.reduce(
          (sum: number, item: any) => sum + item.score,
          0
        );
        progress.average_score = parseFloat(
          (totalScore / progress.history.length).toFixed(1)
        );
      }

      // Cập nhật hoàn thành (Dùng totalSentences từ client gửi lên -> Đỡ tốn 1 query)
      if (totalSentences && progress.history.length >= totalSentences) {
        progress.is_completed = true;
      }

      await progress.save();
    } catch (saveError) {
      console.error(
        "Lỗi lưu tiến độ (Không ảnh hưởng kết quả trả về):",
        saveError
      );
    }

    return NextResponse.json(successResponse(aiFeedback), { status: 200 });
  } catch (error: any) {
    console.error("Error checking sentence:", error);
    return NextResponse.json(
      errorResponse(error?.message || "Lỗi server", 500),
      { status: 500 }
    );
  }
}
