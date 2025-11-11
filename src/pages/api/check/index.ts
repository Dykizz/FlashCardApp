import { NextApiResponse } from "next";
import { withAuth, NextApiRequestWithUser } from "@/lib/withAuth";
import { errorResponse } from "@/lib/response";
import { checkRateLimit } from "@/lib/rateLimit";

async function handler(req: NextApiRequestWithUser, res: NextApiResponse) {
  const identifier = req.user.userId;

  const { success, headers } = await checkRateLimit(identifier, "api");

  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (!success) {
    return res
      .status(429)
      .json(errorResponse("Quá nhiều yêu cầu. Vui lòng thử lại sau.", 429));
  }
  if (req.method === "GET") {
    res.status(200).json({
      message: "ok",
      user: req.user,
    });
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler); // ⭐ Wrap với withAuth để check login
