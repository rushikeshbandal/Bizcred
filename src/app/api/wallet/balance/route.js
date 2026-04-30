import { connectDB } from "@/config/db";
import Wallet from "@/models/Wallet";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function POST(req) {
  await connectDB();

  verifyAdmin(req);

  const { userId } = await req.json();

  const wallet = await Wallet.findOne({ userId });

  return Response.json({
    balance: wallet?.balance || 0
  });
}