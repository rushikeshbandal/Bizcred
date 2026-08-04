import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/config/db";
import User from "@/models/User";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
    }

    const { status } = await req.json();
    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status." }, { status: 400 });
    }

    const customer = await User.findById(params.id);
    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found." }, { status: 404 });
    }

    // Approval requires both Aadhaar and PAN to actually be verified —
    // an admin can't approve someone who never completed verification.
    if (status === "approved" && (!customer.kyc?.aadhaarVerified || !customer.kyc?.panVerified)) {
      return NextResponse.json(
        { success: false, message: "Both Aadhaar and PAN must be verified before approving." },
        { status: 400 }
      );
    }

    customer.kyc.status = status;
    await customer.save();

    return NextResponse.json({ success: true, message: `KYC ${status}.` });
  } catch (err) {
    console.error("Admin kyc-users PATCH error:", err);
    return NextResponse.json({ success: false, message: "Something went wrong." }, { status: 500 });
  }
}