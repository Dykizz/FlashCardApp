import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/response";
import { UserModel } from "@/models/User";
import { SourceArticleModel } from "@/models/LearnWriting/SourceArticle";
import { UserProgressModel } from "@/models/LearnWriting/UserProgress";
import { FlashCardModel } from "@/models/FlashCard";
import { FlashCardProgressModel } from "@/models/FlashCardProgress";
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

    const [
      totalUsers,
      totalArticles,
      totalFlashcards,
      totalWritingSessions,
      totalFlashcardLearns,
      recentArticles,
      recentWritingActivity,
      recentFlashcardActivity,
    ] = await Promise.all([
      // --- THỐNG KÊ SỐ LƯỢNG ---
      UserModel.countDocuments(),
      SourceArticleModel.countDocuments(),
      FlashCardModel.countDocuments(),
      UserProgressModel.countDocuments(),
      FlashCardProgressModel.countDocuments(),

      SourceArticleModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title_vn topic level createdAt")
        .lean(),

      // --- HOẠT ĐỘNG LUYỆN VIẾT GẦN ĐÂY ---
      UserProgressModel.find()
        .sort({ updatedAt: -1 })
        .limit(10) // Lấy 10 để sau này merge
        .populate("userId", "name image email")
        .populate("articleId", "title_vn topic")
        .lean(),

      // --- HOẠT ĐỘNG FLASHCARD GẦN ĐÂY ---
      FlashCardProgressModel.find()
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate("userId", "name image email")
        .populate("flashCardId", "title subject")
        .lean(),
    ]);

    const formatWriting = recentWritingActivity.map((item: any) => ({
      _id: item._id,
      type: "writing",
      user: item.userId,
      target: item.articleId?.title_vn || "Bài viết đã xóa",
      detail: `${item.average_score}/10 điểm`,
      status: item.is_completed ? "Hoàn thành" : "Đang làm",
      time: item.updatedAt,
    }));

    const formatFlashcard = recentFlashcardActivity.map((item: any) => ({
      _id: item._id,
      type: "flashcard",
      user: item.userId,
      target: item.flashCardId?.title || "Flashcard đã xóa",
      detail: `${item.count} lần học`,
      status: "Đang học",
      time: item.updatedAt,
    }));

    // Gộp và sort lại theo thời gian giảm dần
    const combinedActivities = [...formatWriting, ...formatFlashcard]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    // 4. Trả về kết quả
    return NextResponse.json(
      successResponse({
        stats: {
          totalUsers,
          totalContent: totalArticles + totalFlashcards,
          totalActivities: totalWritingSessions + totalFlashcardLearns,
          breakdown: {
            articles: totalArticles,
            flashcards: totalFlashcards,
            writingSessions: totalWritingSessions,
            flashcardLearns: totalFlashcardLearns,
          },
        },
        recentArticles, // Danh sách bài viết mới thêm
        recentActivities: combinedActivities, // Timeline hoạt động tổng hợp
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Dashboard Error:", error);
    return NextResponse.json(
      errorResponse(error.message || "Lỗi server", 500),
      { status: 500 }
    );
  }
}
