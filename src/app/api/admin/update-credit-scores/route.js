import { connectDB } from "@/config/db";
import User from "@/models/User";
import { calculateCreditScore } from "@/utils/calculateCreditScore";

export async function GET() {
  await connectDB();

  const users = await User.find();

  for (const user of users) {
    user.creditScore = calculateCreditScore(user);
    await user.save();
  }

  return Response.json({
    success: true,
    message: "Credit scores updated"
  });
}