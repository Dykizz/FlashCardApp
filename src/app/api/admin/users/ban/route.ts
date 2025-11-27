import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { UserRole } from "@/types/user.type";
import mongoose from "mongoose";

const errorResponse = (message: string, statusCode: number) => {
  return { success: false, message, statusCode };
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(errorResponse("Unauthorized", 403), {
        status: 403,
      });
    }

    const body = await req.json();
    const { userId, isBanned } = body;

    if (!userId) {
      return NextResponse.json(errorResponse("Thiếu User ID", 400), {
        status: 400,
      });
    }

    await dbConnect();

    const updatedUser = await UserModel.findByIdAndUpdate(
      new mongoose.Types.ObjectId(userId),
      { isBanned: isBanned }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        errorResponse("Không tìm thấy người dùng", 404),
        {
          status: 404,
        }
      );
    }

    return NextResponse.json("Cập nhật trạng thái thành công");
  } catch (error) {
    console.error("Lỗi API Ban User:", error);
    return NextResponse.json(errorResponse("Lỗi hệ thống", 500), {
      status: 500,
    });
  }
}
