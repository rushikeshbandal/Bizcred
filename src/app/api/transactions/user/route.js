import { connectDB } from "@/config/db";
import Transaction from "@/models/Transaction";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function GET(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({
        success: false,
        message: "UserId required",
      });
    }

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      transactions,
    });

  } catch (error) {
    console.error(error);

    return Response.json({
      success: false,
      message: "Error fetching transactions",
    });
  }
}