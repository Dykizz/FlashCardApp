import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { errorResponse, successResponse } from "@/lib/response";
import {
  SourceArticle,
  SourceArticleModel,
} from "@/models/LearnWriting/SourceArticle";
import { CreateArticleDTO } from "@/lib/validators/article.schema";
import { UserRole } from "@/types/user.type";
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(errorResponse("ID bài viết không hợp lệ", 400), {
        status: 400,
      });
    }
    const deletedArticle = await SourceArticleModel.findByIdAndDelete(id);
    if (!deletedArticle) {
      return NextResponse.json(
        errorResponse("Không tìm thấy bài viết để xóa", 404),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse("Xóa bài viết thành công"), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      errorResponse(error?.message || "Lỗi máy chủ khi xóa bài viết", 500),
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(errorResponse("ID bài viết không hợp lệ", 400), {
        status: 400,
      });
    }
    const body = await req.json();
    const validationResult = CreateArticleDTO.partial().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(errorResponse("Dữ liệu không hợp lệ", 400), {
        status: 400,
      });
    }

    const validData = validationResult.data;

    const updateData: any = { ...validData };

    if (validData.source_sentences) {
      updateData.source_sentences = validData.source_sentences.map(
        (s, index) => ({
          sentence_id: index + 1,
          content_vn: s.content_vn,
          complexity_score: s.complexity_score || 0,
          hints: s.hints,
        })
      );
    }

    const updatedArticle = await SourceArticleModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedArticle) {
      return NextResponse.json(
        errorResponse("Không tìm thấy bài viết để cập nhật", 404),
        { status: 404 }
      );
    }

    return NextResponse.json(successResponse("Cập nhật bài viết thành công!"), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      errorResponse(error?.message || "Lỗi máy chủ khi cập nhật bài viết", 500),
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(errorResponse("Vui lòng đăng nhập", 401), {
        status: 401,
      });
    }

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(errorResponse("ID bài viết không hợp lệ", 400), {
        status: 400,
      });
    }

    // const fullArticle = await getCached(
    //   `source-article-detail:${id}`,
    //   async () => {
    //     const data = (await SourceArticleModel.findById(
    //       id
    //     ).lean()) as SourceArticle | null;
    //     return data;
    //   },
    //   300
    // );

    const fullArticle = (await SourceArticleModel.findById(
      id
    ).lean()) as SourceArticle | null;

    if (!fullArticle) {
      return NextResponse.json(errorResponse("Không tìm thấy bài viết", 404), {
        status: 404,
      });
    }

    const isAdmin = session.user.role === UserRole.ADMIN;

    let responseData = fullArticle;

    if (!isAdmin) {
      responseData = {
        ...fullArticle,
        source_sentences: fullArticle.source_sentences.map((s: any) => {
          const { sample_answers, ...rest } = s;
          return rest;
        }),
      };
    }

    return NextResponse.json(successResponse(responseData), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error fetching article details:", error);
    return NextResponse.json(
      errorResponse(
        error?.message || "Lỗi máy chủ khi lấy chi tiết bài viết",
        500
      ),
      { status: 500 }
    );
  }
}
