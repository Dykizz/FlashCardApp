import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { errorResponse } from "./lib/response";

export default withAuth(
  function middleware(req) {
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
    const token = req.nextauth.token;

    if (token && token.isBanned) {
      return NextResponse.json(
        errorResponse("Tài khoản của bạn đã bị khóa", 403),
        {
          status: 403,
        }
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/api/(?!auth).*"],
};
