import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { FileModel, FileStatus } from "@/models/File.model";
import { errorResponse } from "@/lib/response";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(errorResponse("Vui lòng đăng nhập", 401), {
        status: 401,
      });
    }

    const body = await request.json();
    const { url, publicId, format, bytes, resource_type } = body;

    await dbConnect();

    const newFile = await FileModel.create({
      url,
      publicId,
      type: resource_type || "image",
      size: bytes,
      mimeType: format ? `${resource_type || "image"}/${format}` : undefined,
      status: FileStatus.TEMP,
      userId: session.user.id,
    });

    return NextResponse.json({ success: true, data: newFile });
  } catch (error: any) {
    return NextResponse.json(errorResponse("Lỗi cron job", 500), {
      status: 500,
    });
  }
}
