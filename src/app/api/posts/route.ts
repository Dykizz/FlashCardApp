import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { errorResponse, successResponse } from "@/lib/response";
import slugify from "slugify";
import { UserRole } from "@/types/user.type";
import { PostStatus } from "@/types/post";
import { PostModel } from "@/models/post.model";
import { FilterQuery } from "mongoose";
import { getCached } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(errorResponse("Vui lòng đăng nhập", 401), {
        status: 401,
      });
    }
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortField = searchParams.get("sort") || "createdAt";
    const sortOrder = searchParams.get("order") === "desc" ? -1 : 1;
    const status = searchParams.get("status");

    // ⭐ Cache key bao gồm tất cả params
    const cacheKey = `posts:${page}-${limit}-${search}-${sortField}-${sortOrder}-${status}`;

    const result = await getCached(
      cacheKey,
      async () => {
        console.log(`LOG: Querying Posts from DB (Cache Miss)...`);

        const filter: FilterQuery<typeof PostModel> = {};

        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ];
        }

        if (status) {
          filter.status = status;
        }

        const skip = (page - 1) * limit;

        const posts = await PostModel.find(filter)
          .sort({ [sortField]: sortOrder })
          .skip(skip)
          .limit(limit)
          .populate("author", "name email image")
          .lean();

        const totalDocs = await PostModel.countDocuments(filter);
        const totalPages = Math.ceil(totalDocs / limit);

        return {
          data: posts,
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
    });
  } catch (error: any) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      errorResponse(
        error?.message || "Lỗi máy chủ khi lấy danh sách bài viết",
        500
      ),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(errorResponse("Vui lòng đăng nhập", 401), {
        status: 401,
      });
    }

    const user = session.user;
    if (user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        errorResponse("Bạn không có quyền tạo bài viết", 403),
        { status: 403 }
      );
    }

    await dbConnect();
    const body = await req.json();
    const { title, content, description, thumbnail, tags, status } = body;

    if (!title || !content) {
      return NextResponse.json(
        errorResponse("Tiêu đề và nội dung là bắt buộc", 400),
        {
          status: 400,
        }
      );
    }

    let slug = body.slug;
    if (!slug) {
      slug = slugify(title, { lower: true, strict: true, locale: "vi" });
    }

    const existingPost = await PostModel.findOne({ slug });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const publishedAt =
      status === PostStatus.PUBLISHED ? new Date() : undefined;

    const newPost = await PostModel.create({
      title,
      slug,
      content,
      description,
      thumbnail,
      tags: tags || [],
      status: status || PostStatus.DRAFT,
      author: user.id,
      publishedAt,
    });

    return NextResponse.json(successResponse(newPost), { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      errorResponse(error?.message || "Lỗi máy chủ khi tạo bài viết", 500),
      { status: 500 }
    );
  }
}
