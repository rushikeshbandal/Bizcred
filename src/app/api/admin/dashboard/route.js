import { connectDB } from "@/config/db";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import { verifyAdmin } from "@/middleware/authMiddleware";

export async function GET(req) {
  await connectDB();

  verifyAdmin(req);

  const totalUsers = await User.countDocuments();

  const wallets = await Wallet.find();
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const totalTransactions = await Transaction.countDocuments();

  const credits = await Transaction.aggregate([
    { $match: { type: "credit" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const debits = await Transaction.aggregate([
    { $match: { type: "debit" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  return Response.json({
    success: true,
    totalUsers,
    totalBalance,
    totalTransactions,
    totalCredit: credits[0]?.total || 0,
    totalDebit: debits[0]?.total || 0,
  });
}