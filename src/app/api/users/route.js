import { verifyToken } from "@/middleware/authMiddleware";

export async function GET(req) {

  try {

    const decoded = verifyToken(req);

    return Response.json({
      message: "Authorized user",
      user: decoded
    });

  } catch (error) {

    return Response.json({
      message: "Unauthorized"
    });
  }
}