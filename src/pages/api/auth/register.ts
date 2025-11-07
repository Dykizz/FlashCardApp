import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { errorResponse, successResponse } from "@/lib/response";
import { UserSchema } from "@/models/User";
import { checkRateLimit } from "@/lib/rateLimit";
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const USERNAME_REGEX = /^[a-z0-9_-]+$/;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const identifier =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || "anonymous";

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

  const { username, password, displayName } = req.body;

  if (!username || !password || !displayName)
    return res.status(400).json(errorResponse("Thiếu trường thông tin"));

  if (!USERNAME_REGEX.test(username))
    return res.status(400).json(errorResponse("Username không hợp lệ"));

  try {
    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json(errorResponse("Tên người dùng đã tồn tại"));

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashed,
      displayName,
    });
    await user.save();

    return res.status(201).json(
      successResponse({
        id: user._id,
        username: user.username,
        displayName: user.displayName,
      })
    );
  } catch (err: any) {
    return res.status(500).json(errorResponse(err.message, 500));
  }
}
