import { connectDB } from "@/config/db";
import Transaction from "@/models/Transaction";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return Response.json(
        { success: false, message: "Session expired. Please log in again." },
        { status: 401 }
      );
    }

    const transactions = await Transaction.find({ user: decoded.id })
      .sort({ createdAt: -1 })
      .lean();

    let totalCredit = 0;
    let totalDebit = 0;

    transactions.forEach((t) => {
      if (t.type === "credit") totalCredit += t.amount || 0;
      else if (t.type === "debit") totalDebit += t.amount || 0;
    });

    return Response.json({
      success: true,
      transactions,
      summary: {
        totalCredit,
        totalDebit,
        count: transactions.length,
      },
    });
  } catch (error) {
    console.log(error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}