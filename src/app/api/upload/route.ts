// ...existing code...
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/response";
import cloudinary from "@/lib/cloudinary";
import { checkRateLimit } from "@/lib/rateLimit"; // ⭐ Thêm rate limit
import { FileModel } from "@/models/File.model";

const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = "nextjs-blog"
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export async function POST(request: NextRequest) {
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

    await dbConnect();

    const identifier = session.user.email;
    const { success, headers } = await checkRateLimit(identifier, "api");

    if (!success) {
      return NextResponse.json(
        errorResponse("Quá nhiều yêu cầu upload. Vui lòng thử lại sau.", 429),
        { status: 429, headers: Object.fromEntries(Object.entries(headers)) }
      );
    }

    // 1. Lấy dữ liệu từ FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(errorResponse("Không tìm thấy file", 400), {
        status: 400,
      });
    }

    // 2. Chuyển File object thành Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload lên Cloudinary
    const result = await uploadToCloudinary(buffer, "blog-images");

    await FileModel.create({
      url: result.secure_url,
      publicId: result.public_id,
      status: "temp",
    });

    return NextResponse.json(
      successResponse({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      }),
      {
        status: 200,
        headers: Object.fromEntries(Object.entries(headers)),
      }
    );
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(errorResponse("Lỗi upload ảnh", 500), {
      status: 500,
    });
  }
}
