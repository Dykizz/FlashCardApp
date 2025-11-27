import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { errorResponse } from "@/lib/response";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(errorResponse("Vui lòng đăng nhập", 400), {
        status: 401,
      });
    }

    await dbConnect();

    await UserModel.findByIdAndUpdate(session.user.id, {
      lastLogin: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ping error:", error);
    return NextResponse.json(errorResponse("Lỗi server", 500), { status: 500 });
  }
}
