import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyPan } from "@/lib/sandbox";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// Convert a stored date (Date object or ISO string) to DD/MM/YYYY for Sandbox
function toSandboxDob(dateInput) {
  const d = new Date(dateInput);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export async function POST(req) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    if (user.kyc?.panVerified) {
      return NextResponse.json({ success: false, message: "PAN is already verified." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));

    // Figure out which PAN / name / dob to verify:
    // - if the user updated any field, use that
    // - otherwise fall back to what's on file from registration
    const panToVerify = (body.pan || user.kyc?.pan || "").trim().toUpperCase();
    const nameToVerify = (body.name_as_per_pan || user.kyc?.panNameAsPerPan || user.name || "").trim();
    const dobToVerify = body.date_of_birth || user.kyc?.panDobOverride || (user.dob ? toSandboxDob(user.dob) : "");

    if (!panToVerify || !PAN_REGEX.test(panToVerify)) {
      return NextResponse.json({ success: false, message: "Enter a valid PAN number (e.g. ABCDE1234F)." }, { status: 400 });
    }
    if (!nameToVerify) {
      return NextResponse.json({ success: false, message: "Name as per PAN is required." }, { status: 400 });
    }
    if (!dobToVerify) {
      return NextResponse.json({ success: false, message: "Date of birth is required." }, { status: 400 });
    }

    // Persist whatever the user is verifying with, so "Update" reflects next time too
    user.kyc.pan = panToVerify;
    user.kyc.panNameAsPerPan = nameToVerify;
    user.kyc.panDobOverride = dobToVerify;

    const { ok, data } = await verifyPan(panToVerify, nameToVerify, dobToVerify);

    if (!ok || !data?.data) {
      await user.save();
      return NextResponse.json(
        { success: false, message: data?.message || "PAN verification failed. Please try again." },
        { status: 400 }
      );
    }

    const result = data.data;

    user.kyc.panVerified = true;
    user.kyc.panVerifiedCategory = result.category;
    user.kyc.panVerifiedStatus = result.status;
    user.kyc.panNameMatch = result.name_as_per_pan_match;
    user.kyc.panDobMatch = result.date_of_birth_match;
    user.kyc.panAadhaarSeedingStatus = result.aadhaar_seeding_status;
    user.kyc.panVerifiedAt = new Date();

    await user.save();

    return NextResponse.json({
      success: true,
      message: "PAN verified successfully.",
      details: {
        pan: result.pan,
        category: result.category,
        status: result.status,
        nameMatch: result.name_as_per_pan_match,
        dobMatch: result.date_of_birth_match,
        aadhaarSeeding: result.aadhaar_seeding_status,
      },
    });
  } catch (err) {
    console.error("PAN verify error:", err);
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}