import { connectDB } from "@/config/db";
import SupportTicket from "@/models/SupportTicket";
import jwt from "jsonwebtoken";

export async function GET(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const tickets = await SupportTicket.find({ userId: decoded.id }).sort({ createdAt: -1 });

    return Response.json({ success: true, tickets });
  } catch (error) {
    console.error("My tickets error:", error);
    return Response.json({ success: false, message: "Invalid token" }, { status: 401 });
  }
}