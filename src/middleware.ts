import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Chỉ chặn bot trong production
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev) {
    const userAgent = request.headers.get("user-agent") || "";
    const botPattern = /bot|crawler|spider|scraper/i;

    if (botPattern.test(userAgent)) {
      return NextResponse.json(
        { error: "Yêu cầu truy cập bị từ chối" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*", // Áp dụng cho tất cả API routes
};
