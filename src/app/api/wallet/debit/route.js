import { connectDB } from "@/config/db";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import User from "@/models/User"; // ✅ REQUIRED
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function POST(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const { userId, amount } = await req.json();

    // ✅ VALIDATION
    if (!userId || amount <= 0) {
      return Response.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    // ✅ CHECK USER
    const user = await User.findById(userId);

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ BLOCK / SUSPEND CHECK
    if (user.status !== "active") {
      return Response.json({
        success: false,
        message: "User is not allowed to perform transactions",
      });
    }

    // ✅ GET WALLET
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return Response.json(
        { success: false, message: "Wallet not found" },
        { status: 404 }
      );
    }

    // ✅ BALANCE CHECK
    if (wallet.balance < amount) {
      return Response.json(
        { success: false, message: "Insufficient balance" },
        { status: 400 }
      );
    }

    // ✅ UPDATE BALANCE
    wallet.balance -= amount;
    await wallet.save();

    // ✅ SAVE TRANSACTION
    await Transaction.create({
      userId,
      type: "debit",
      amount,
    });

    return Response.json({
      success: true,
      message: "Amount debited",
      balance: wallet.balance,
    });

  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      message: "Server error",
    });
  }
}