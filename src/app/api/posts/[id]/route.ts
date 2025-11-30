import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose, { FilterQuery } from "mongoose";
import dbConnect from "@/lib/mongodb";
import { errorResponse, successResponse } from "@/lib/response";
import { UserRole } from "@/types/user.type";
import { PostModel } from "@/models/post.model";
import { PostDetail, PostStatus } from "@/types/post";
import { getCached, invalidateCache } from "@/lib/cache";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { user } = session;
    await dbConnect();
    const { id } = await params;

    const query: FilterQuery<typeof PostModel> = {};

    if (mongoose.Types.ObjectId.isValid(id)) {
      query._id = id;
    } else {
      query.slug = id;
    }

    const cacheKey = `post-detail:${id}`;
    const post: PostDetail = await getCached(
      cacheKey,
      async () => {
        console.log(`LOG: Querying Post ${id} from DB (Cache Miss)...`);
        const data = await PostModel.findOne(query)
          .populate("author", "name email image")
          .lean();
        return data as unknown as PostDetail;
      },
      900
    );

    if (!post) {
      return NextResponse.json(errorResponse("Không tìm thấy bài viết", 404), {
        status: 404,
      });
    }

    // Kiểm tra quyền xem bài viết chưa publish
    if (user.role !== UserRole.ADMIN && post.status !== PostStatus.PUBLISHED) {
      if (!session) {
        return NextResponse.json(
          errorResponse("Bài viết chưa được xuất bản", 400),
          { status: 400 }
        );
      }

      const isAdmin = session.user.role === UserRole.ADMIN;
      const isAuthor = post.author._id.toString() === session.user.id;

      if (!isAdmin && !isAuthor) {
        return NextResponse.json(
          errorResponse("Bài viết chưa được xuất bản", 400),
          { status: 400 }
        );
      }
    }

    if (
      user.role !== UserRole.ADMIN &&
      user.id !== post.author._id.toString()
    ) {
      await PostModel.findByIdAndUpdate(post._id, { $inc: { views: 1 } });
    }

    return NextResponse.json(successResponse(post), { status: 200 });
  } catch (error: any) {
    console.error("Error fetching post detail:", error);
    return NextResponse.json(
      errorResponse(error?.message || "Lỗi máy chủ", 500),
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

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(errorResponse("ID bài viết không hợp lệ", 400), {
        status: 400,
      });
    }

    const existingPost = await PostModel.findById(id);
    if (!existingPost) {
      return NextResponse.json(errorResponse("Không tìm thấy bài viết", 404), {
        status: 404,
      });
    }

    const isAdmin = session.user.role === UserRole.ADMIN;
    const isAuthor = existingPost.author.toString() === session.user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        errorResponse("Bạn không có quyền sửa bài viết này", 403),
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, slug, status, ...otherData } = body;

    const updateData: any = { ...otherData };

    if (slug) {
      // Check trùng slug nếu slug thay đổi
      if (slug !== existingPost.slug) {
        const duplicate = await PostModel.findOne({ slug, _id: { $ne: id } });
        if (duplicate) {
          return NextResponse.json(errorResponse("Slug đã tồn tại", 400), {
            status: 400,
          });
        }
        updateData.slug = slug;
      }
    } else if (title && title !== existingPost.title) {
      updateData.title = title;
    } else if (title) {
      updateData.title = title;
    }

    if (status) {
      updateData.status = status;
      if (status === PostStatus.PUBLISHED && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const updatedPost = await PostModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    await invalidateCache(`post-detail:${id}`);
    return NextResponse.json(successResponse(updatedPost), { status: 200 });
  } catch (error: any) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      errorResponse(error?.message || "Lỗi máy chủ", 500),
      { status: 500 }
    );
  }
}

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
      return NextResponse.json(errorResponse("Bạn không có quyền xóa", 403), {
        status: 403,
      });
    }

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(errorResponse("ID không hợp lệ", 400), {
        status: 400,
      });
    }

    const deletedPost = await PostModel.findByIdAndDelete(id);

    if (!deletedPost) {
      return NextResponse.json(errorResponse("Không tìm thấy bài viết", 404), {
        status: 404,
      });
    }

    await invalidateCache(`post-detail:${id}`);

    return NextResponse.json(successResponse("Xóa bài viết thành công"), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      errorResponse(error?.message || "Lỗi máy chủ", 500),
      { status: 500 }
    );
  }
}
