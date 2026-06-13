import { connectDB } from "@/config/db";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import User from "@/models/User"; // ✅ MISSING IMPORT ADDED
import { verifyAdmin } from "@/middleware/authMiddleware";
import { sendEmail } from "@/utils/sendEmail";

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

    // ✅ BLOCKED / SUSPENDED CHECK
    if (user.status === "blocked" || user.status === "suspended") {
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

    // ✅ UPDATE BALANCE
    wallet.balance += amount;
    await wallet.save();

    // ✅ SAVE TRANSACTION
    await Transaction.create({
      user: userId,
      type: "credit",
      amount,
    });

    // ✅ SEND EMAIL
    await sendEmail(
      user.email,
      "Wallet Credit Alert",
      `
      <h2>Wallet Credited Successfully</h2>

      <p>Hello ${user.name || "User"},</p>

      <p>Your wallet has been credited.</p>

      <p><strong>Amount:</strong> ₹${amount}</p>

      <p><strong>Updated Balance:</strong> ₹${wallet.balance}</p>

      <p>Thank you for using BizCred.</p>
      `
    );

    return Response.json({
      success: true,
      message: "Amount credited",
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