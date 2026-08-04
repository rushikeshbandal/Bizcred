import { connectDB } from "@/config/db";
import SupportTicket from "@/models/SupportTicket";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { subject, message, priority } = body;

    if (!subject?.trim() || !message?.trim()) {
      return Response.json(
        { success: false, message: "Subject and message are required." },
        { status: 400 }
      );
    }

    const ticket = await SupportTicket.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || "Medium",
    });

    return Response.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("Support create error:", error);
    return Response.json(
      { success: false, message: "Something went wrong." },
      { status: 500 }
    );
  }
}