import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(toEmail, otp) {
  await transporter.sendMail({
    from: `"BizCred" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: "Your BizCred Login Code",
    html: `
      <div style="font-family: -apple-system, Arial, sans-serif; max-width: 420px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color:#111827; margin-bottom:4px;">BizCred Login Verification</h2>
        <p style="color:#6b7280; font-size:14px; margin-top:0;">Use the code below to complete your sign-in. This code expires in 5 minutes.</p>
        <div style="text-align:center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color:#1d4ed8;">${otp}</span>
        </div>
        <p style="color:#9ca3af; font-size:12px;">If you did not attempt to log in, you can safely ignore this email.</p>
      </div>
    `,
  });
}