import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { errorResponse } from "./response";
import { IUser } from "@/types/user.type";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "your-secret-key";

export interface NextApiRequestWithUser extends NextApiRequest {
  user: IUser;
}

export function withAuth(
  handler: (req: NextApiRequestWithUser, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json(errorResponse("Unauthorized", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as IUser;
      (req as NextApiRequestWithUser).user = decoded;

      return handler(req as NextApiRequestWithUser, res);
    } catch (err) {
      return res
        .status(401)
        .json(errorResponse("AccessToken không hợp lệ", 401));
    }
  };
}
