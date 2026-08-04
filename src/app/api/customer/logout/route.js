import jwt from "jsonwebtoken";
import { sendLogoutAlertEmail } from "@/config/mailer";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return Response.json({ success: true, message: "Logged out" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Expired or invalid token — nothing to email about, still let the client log out
      return Response.json({ success: true, message: "Logged out" });
    }

    try {
      await sendLogoutAlertEmail(decoded.email, { time: new Date().toLocaleString() });
    } catch (mailErr) {
      console.log("Logout alert email error:", mailErr.message);
    }

    return Response.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.log(error);
    // Logout should never block the client, even on server error
    return Response.json({ success: true, message: "Logged out" });
  }
}