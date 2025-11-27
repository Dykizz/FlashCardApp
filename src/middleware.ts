import { NextResponse } from "next/server";
import { errorResponse } from "./lib/response";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev) {
    const userAgent = req.headers.get("user-agent") || "";
    const botPattern = /bot|crawler|spider|scraper/i;
    if (botPattern.test(userAgent)) {
      return NextResponse.json(
        { error: "Yêu cầu truy cập bị từ chối" },
        { status: 403 }
      );
    }
  }

  if (req.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token && token.isBanned) {
    return NextResponse.json(
      errorResponse("Tài khoản của bạn đã bị khóa", 403),
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
