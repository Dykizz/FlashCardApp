import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { errorResponse, successResponse } from "@/lib/response";
import { SourceArticleModel } from "@/models/LearnWriting/SourceArticle";
import { CreateArticleDTO } from "@/lib/validators/article.schema";
import { FilterQuery } from "mongoose";
import { analyzeAndGenerateContent } from "@/lib/ai-service";
import { getCached } from "@/lib/cache";
import { UserRole } from "@/types/user.type";
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(errorResponse("Vui lòng đăng nhập", 401), {
        status: 401,
      });
    }
    const isAdmin = session.user.role === UserRole.ADMIN;
    if (!isAdmin) {
      return NextResponse.json(
        errorResponse("Bạn không có quyền thực hiện hành động này", 403),
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();

    const validationResult = CreateArticleDTO.safeParse(body);

    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      return NextResponse.json(
        {
          ...errorResponse("Dữ liệu không hợp lệ", 400),
          errors: issues,
        },
        { status: 400 }
      );
    }

    const validData = validationResult.data;

    if (
      validData.original_text &&
      validData.source_sentences &&
      validData.source_sentences.length > 0
    ) {
      try {
        console.log("🤖 Đang gọi AI để phân tích bài viết...");
        const source_sentencesNew = await Promise.all(
          validData.source_sentences.map(async (sentence) => {
            const aiResult = await analyzeAndGenerateContent(
              sentence.content_vn,
              validData.level,
              sentence.sample_answers?.[0] || undefined
            );
            return {
              content_vn: sentence.content_vn,
              complexity_score: aiResult.sentences[0].complexity_score,
              sample_answers: aiResult.sentences[0].sample_answers,
              hints: aiResult.sentences[0].hints,
            };
          })
        );

        validData.source_sentences = source_sentencesNew;
        console.log("✅ AI đã phân tích xong bài viết.");
      } catch (aiError) {
        console.error("Lỗi AI:", aiError);
        return NextResponse.json(
          errorResponse(
            "Lỗi khi gọi AI tạo nội dung. Vui lòng thử lại hoặc nhập thủ công.",
            500
          ),
          { status: 500 }
        );
      }
    }

    const newArticle = await SourceArticleModel.create({
      title_vn: validData.title_vn,
      topic: validData.topic,
      level: validData.level,
      original_text: validData.original_text,
      description: validData.description,
      source_sentences: validData.source_sentences.map((s, index) => ({
        sentence_id: index + 1,
        content_vn: s.content_vn,
        complexity_score: s.complexity_score || 0,
        sample_answers: s.sample_answers || [],
        hints: s.hints,
      })),
    });

    return NextResponse.json(successResponse(newArticle), { status: 201 });
  } catch (error: any) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      errorResponse(error?.message || "Lỗi máy chủ khi tạo bài viết", 500),
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        errorResponse("Vui lòng đăng nhập để truy cập", 401),
        { status: 401 }
      );
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "all";
    const topic = searchParams.get("topic") || "";

    const cacheKey = `source-articles-list:p${page}:l${limit}:s${search}:lv${level}:t${topic}`;

    // const result = await getCached(
    //   cacheKey,
    //   async () => {
    //     console.log(`LOG: Querying DB for ${cacheKey} (Cache Miss)...`);
    //     const filter: FilterQuery<typeof SourceArticleModel> = {};

    //     if (search) {
    //       filter.$or = [
    //         { title_vn: { $regex: search, $options: "i" } },
    //         { topic: { $regex: search, $options: "i" } },
    //       ];
    //     }

    //     if (level && level !== "all") {
    //       filter.level = level;
    //     }

    //     if (topic) {
    //       filter.topic = topic;
    //     }
    //     const skip = (page - 1) * limit;

    //     const [articles, totalDocs] = await Promise.all([
    //       SourceArticleModel.find(filter)
    //         .sort({ createdAt: -1 })
    //         .skip(skip)
    //         .limit(limit)
    //         .lean(),
    //       SourceArticleModel.countDocuments(filter),
    //     ]);

    //     return { articles, totalDocs };
    //   },
    //   300
    // );

    const filter: FilterQuery<typeof SourceArticleModel> = {};

    if (search) {
      filter.$or = [
        { title_vn: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
      ];
    }

    if (level && level !== "all") {
      filter.level = level;
    }

    if (topic) {
      filter.topic = topic;
    }
    const skip = (page - 1) * limit;

    const [articles, totalDocs] = await Promise.all([
      SourceArticleModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SourceArticleModel.countDocuments(filter),
    ]);

    //   const result = { articles, totalDocs };
    // const { articles, totalDocs } = result || { articles: [], totalDocs: 0 };
    const totalPages = Math.ceil(totalDocs / limit);

    return NextResponse.json(
      successResponse(articles, {
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
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      errorResponse("Lỗi server khi tải danh sách bài viết", 500),
      { status: 500 }
    );
  }
}
