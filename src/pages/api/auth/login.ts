import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { errorResponse, successResponse } from "@/lib/response";
import { UserSchema } from "@/models/User";
import { checkRateLimit } from "@/lib/rateLimit";
import { IUser } from "@/types/user.type";

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

const EXPIRES_ACCESS_TOKEN = (process.env.EXPIRES_ACCESS_TOKEN ||
  "1h") as string;
const EXPIRES_REFRESH_TOKEN = (process.env.EXPIRES_REFRESH_TOKEN ||
  "7d") as string;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

function serializeCookie(
  name: string,
  val: string,
  opts: {
    httpOnly?: boolean;
    path?: string;
    maxAge?: number;
    sameSite?: string;
    secure?: boolean;
  }
) {
  const parts = [`${name}=${val}`];
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (typeof opts.maxAge === "number") parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts.secure) parts.push("Secure");
  return parts.join("; ");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const identifier =
    req.body.username ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress ||
    "anonymous";

  const { success, headers } = await checkRateLimit(
    identifier as string,
    "auth"
  );

  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (!success) {
    return res
      .status(429)
      .json(errorResponse("Quá nhiều yêu cầu. Vui lòng thử lại sau.", 429));
  }

  if (req.method !== "POST")
    return res
      .status(405)
      .json(errorResponse("Phương thức không phù hợp", 405));

  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json(errorResponse("Thiếu trường thông tin"));

  const user = await User.findOne({ username }).select("+password");
  if (!user)
    return res
      .status(403)
      .json(errorResponse("Tài khoản hoặc mật khẩu không hợp lệ", 403));

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res
      .status(403)
      .json(errorResponse("Thông tin đăng nhập không hợp lệ", 403));

  const payload: IUser = {
    userId: user._id.toString(),
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };

  // ⭐ Explicit type for options
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: EXPIRES_ACCESS_TOKEN,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: EXPIRES_REFRESH_TOKEN,
  } as jwt.SignOptions);

  try {
    user.refreshToken = refreshToken;
    await user.save();
  } catch (err) {
    // Nếu lưu thất bại thì vẫn tiếp tục (cookie sẽ được set), nhưng log error nếu cần
    // console.error("Failed to save refresh token to user:", err);
  }

  const secure = process.env.NODE_ENV === "production";
  const cookie = serializeCookie("refreshToken", refreshToken, {
    httpOnly: true,
    path: "/api/auth/refresh",
    maxAge: REFRESH_MAX_AGE,
    sameSite: "Strict",
    secure,
  });
  res.setHeader("Set-Cookie", cookie);

  return res.status(200).json(
    successResponse({
      accessToken,
      user: { username: user.username, displayName: user.displayName },
    })
  );
}
