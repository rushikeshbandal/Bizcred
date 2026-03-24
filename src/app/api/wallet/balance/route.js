import { connectDB } from "@/config/db";
import Wallet from "@/models/Wallet";
import { verifyToken } from "@/middleware/authMiddleware";

export async function GET(req) {

  await connectDB();

  const user = verifyToken(req);

  const wallet = await Wallet.findOne({ userId: user.userId });

  return Response.json({
    balance: wallet.balance
  });
}