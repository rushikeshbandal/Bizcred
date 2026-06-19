import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAdmin } from "@/middleware/authMiddleware";


function calculateAiScore(u) {
  let score = 500;

  // Wallet Balance
  if ((u.wallet?.balance || 0) > 50000)
    score += 120;
  else if ((u.wallet?.balance || 0) > 10000)
    score += 70;
  else
    score += 20;

  // KYC
  if (u.kyc?.pan)
    score += 80;

  if (u.kyc?.aadhaar)
    score += 80;

  // User Status
  if (u.status === "active")
    score += 100;

  if (u.status === "blocked")
    score -= 150;

  if (u.status === "suspended")
    score -= 80;

  // Random Bonus
  score += Math.floor(Math.random() * 50);

  // Max Score
  if (score > 900)
    score = 900;

  return score;
}

export async function GET(req) {
  try {
    await connectDB();

    verifyAdmin(req);

    const users = await User.find().lean();

    const customers = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone || "-",
      pan: u.kyc?.pan || "-",
      aadhaar: u.kyc?.aadhaar || "-",
      kycStatus: u.kyc?.status || "Pending",
        creditScore: calculateAiScore(u),
      sessionId: u.kyc?.sessionId,
    }));

    return Response.json(customers);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}