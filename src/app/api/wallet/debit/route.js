import { connectDB } from "@/config/db";
import Wallet from "@/models/Wallet";
import { verifyToken } from "@/middleware/authMiddleware";

export async function POST(req) {

  await connectDB();

  const user = verifyToken(req);
  const { amount } = await req.json();

  if (amount <= 0) {
    return Response.json({ message: "Invalid amount" });
  }

  const wallet = await Wallet.findOne({ userId: user.userId });

  if (wallet.balance < amount) {
    return Response.json({
      message: "Insufficient balance"
    });
  }

  wallet.balance -= amount;

  await wallet.save();

  return Response.json({
    message: "Amount debited",
    balance: wallet.balance
  });
}