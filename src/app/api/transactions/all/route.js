import { connectDB } from "@/config/db";
import Transaction from "@/models/Transaction";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function GET(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const transactions = await Transaction.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return Response.json({
      success: true,
      transactions,
    });

  } catch (error) {
    return Response.json({
      success: false,
      message: "Error fetching transactions",
    });
  }
}