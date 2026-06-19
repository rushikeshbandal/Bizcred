import { connectDB } from "@/config/db";
import User from "@/models/User";
import { calculateCreditScore } from "@/utils/calculateCreditScore";

export async function GET() {
  try {
    await connectDB();

    const users = await User.find();

    for (const user of users) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            creditScore: calculateCreditScore(user),
          },
        }
      );
    }

    return Response.json({
      success: true,
      message: "Credit scores updated successfully",
    });
  } catch (error) {
    console.error("UPDATE CREDIT SCORE ERROR:", error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}