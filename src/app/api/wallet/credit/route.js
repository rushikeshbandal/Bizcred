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

  wallet.balance += amount;

  await wallet.save();

  return Response.json({
    message: "Amount credited",
    balance: wallet.balance
  });
}