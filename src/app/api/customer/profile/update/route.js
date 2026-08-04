import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import { connectDB } from "@/config/db";
import User from "@/models/User";

const MOBILE_REGEX = /^[6-9]\d{9}$/;
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function PUT(req) {
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

    const formData = await req.formData();

    const name = formData.get("name");
    const mobile = formData.get("mobile");
    const imageFile = formData.get("profileImage");

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (mobile && mobile.trim() !== user.mobile) {
      const cleanMobile = mobile.trim();

      if (!MOBILE_REGEX.test(cleanMobile)) {
        return NextResponse.json({ success: false, message: "Invalid mobile number." }, { status: 400 });
      }

      const existing = await User.findOne({ mobile: cleanMobile, _id: { $ne: user._id } });
      if (existing) {
        return NextResponse.json({ success: false, message: "This mobile number is already in use." }, { status: 409 });
      }

      user.mobile = cleanMobile;
    }

    if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
      if (!ALLOWED_TYPES.includes(imageFile.type)) {
        return NextResponse.json({ success: false, message: "Only JPG, PNG, or WEBP images are allowed." }, { status: 400 });
      }
      if (imageFile.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ success: false, message: "Image must be smaller than 3MB." }, { status: 400 });
      }

      const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await fs.mkdir(uploadDir, { recursive: true });

      const ext = imageFile.type === "image/png" ? "png" : imageFile.type === "image/webp" ? "webp" : "jpg";
      const fileName = `${user._id}-${Date.now()}.${ext}`;
      const filePath = path.join(uploadDir, fileName);

      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      if (user.profileImage) {
        const oldPath = path.join(process.cwd(), "public", user.profileImage);
        fs.unlink(oldPath).catch(() => {});
      }

      user.profileImage = `/uploads/avatars/${fileName}`;
    }

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.kyc?.aadhaarEncrypted;

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: userObj,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    if (err.code === 11000) {
      return NextResponse.json({ success: false, message: "Mobile number already in use." }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again." }, { status: 500 });
  }
}