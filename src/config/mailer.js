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

export async function sendLoginAlertEmail(toEmail, { ip, browser, latitude, longitude, time } = {}) {
  const location =
    latitude != null && longitude != null ? `${latitude.toFixed(3)}, ${longitude.toFixed(3)}` : "Unavailable";

  await transporter.sendMail({
    from: `"BizCred" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: "New sign-in to your BizCred account",
    html: `
      <div style="font-family: -apple-system, Arial, sans-serif; max-width: 420px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color:#111827; margin-bottom:4px;">You just signed in</h2>
        <p style="color:#6b7280; font-size:14px; margin-top:0;">
          Your BizCred account was accessed on ${time || new Date().toLocaleString()}.
        </p>
        <table style="width:100%; font-size:13px; color:#374151; margin: 16px 0; border-collapse: collapse;">
          <tr><td style="padding:6px 0; color:#9ca3af;">IP address</td><td style="text-align:right;">${ip || "Unknown"}</td></tr>
          <tr><td style="padding:6px 0; color:#9ca3af;">Location</td><td style="text-align:right;">${location}</td></tr>
          <tr><td style="padding:6px 0; color:#9ca3af;">Device</td><td style="text-align:right; word-break:break-word;">${browser || "Unknown"}</td></tr>
        </table>
        <p style="color:#9ca3af; font-size:12px;">
          If this wasn't you, change your password immediately and contact BizCred support.
        </p>
      </div>
    `,
  });
}

export async function sendLogoutAlertEmail(toEmail, { time } = {}) {
  await transporter.sendMail({
    from: `"BizCred" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: "You signed out of your BizCred account",
    html: `
      <div style="font-family: -apple-system, Arial, sans-serif; max-width: 420px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color:#111827; margin-bottom:4px;">You've signed out</h2>
        <p style="color:#6b7280; font-size:14px; margin-top:0;">
          Your BizCred session ended on ${time || new Date().toLocaleString()}.
        </p>
        <p style="color:#9ca3af; font-size:12px;">
          If you didn't do this, secure your account and contact BizCred support right away.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordChangedEmail(toEmail, { time } = {}) {
  await transporter.sendMail({
    from: `"BizCred" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: "Your BizCred password was changed",
    html: `
      <div style="font-family: -apple-system, Arial, sans-serif; max-width: 420px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color:#111827; margin-bottom:4px;">Password changed</h2>
        <p style="color:#6b7280; font-size:14px; margin-top:0;">
          Your BizCred account password was changed on ${time || new Date().toLocaleString()}.
        </p>
        <p style="color:#9ca3af; font-size:12px;">
          If you didn't make this change, contact BizCred support immediately.
        </p>
      </div>
    `,
  });
}