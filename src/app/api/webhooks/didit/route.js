import { connectDB } from "@/config/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const payload = await req.json();

    await User.findOneAndUpdate(
      {
        "kyc.sessionId": payload.session_id,
      },
      {
        $set: {
          "kyc.status":
            payload.decision_status ||
            payload.status,
          "kyc.updatedAt": new Date(),
        },
      }
    );

    return Response.json({
      success: true,
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}