import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { successResponse, errorResponse } from "@/lib/response";
import { QuestionModel } from "@/models/Question";
import { UserRole } from "@/types/user.type";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(errorResponse("Unauthorized", 403), {
        status: 403,
      });
    }

    await dbConnect();

    const { id } = await params;
    const body = await req.json();

    const { content, explanation, options, correctAnswer } = body;
    if (!content || !options || correctAnswer == null) {
      return NextResponse.json(
        errorResponse("Thiếu thông tin cần thiết", 400),
        {
          status: 400,
        }
      );
    }

    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      id,
      { content, explanation, options, correctAnswer },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return NextResponse.json(errorResponse("Câu hỏi không tồn tại", 404), {
        status: 404,
      });
    }

    return NextResponse.json(successResponse(updatedQuestion), { status: 200 });
  } catch (error: any) {
    console.error("Update Question API Error:", error);
    return NextResponse.json(errorResponse("Lỗi server", 500), { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(errorResponse("Unauthorized", 403), {
        status: 403,
      });
    }

    await dbConnect();

    const { id } = await params;

    const question = await QuestionModel.findById(id);

    if (!question) {
      return NextResponse.json(errorResponse("Câu hỏi không tồn tại", 404), {
        status: 404,
      });
    }

    return NextResponse.json(successResponse(question), { status: 200 });
  } catch (error: any) {
    console.error("Get Question API Error:", error);
    return NextResponse.json(errorResponse("Lỗi server", 500), { status: 500 });
  }
}
