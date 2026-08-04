"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function EditProfile() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  function getToken() {
    return localStorage.getItem("customerToken");
  }

  function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  async function loadProfile() {
    const token = getToken();
    if (!token) {
      router.push("/customer/login");
      return;
    }

    try {
      const res = await fetch("/api/customer/me", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();

      if (!data.success) {
        router.push("/customer/login");
        return;
      }

      setUser(data.user);
      setName(data.user.name || "");
      setEmail(data.user.email || "");
      setMobile(data.user.mobile || "");
    } catch (err) {
      setError("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }

  function handleImageClick() {
    fileInputRef.current?.click();
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPG, PNG, or WEBP images are allowed.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError("Image must be smaller than 3MB.");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  // Save name / mobile / image — no email involved here at all
  async function handleSaveDetails() {
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("mobile", mobile.trim());
      if (imageFile) {
        formData.append("profileImage", imageFile);
      }

      const res = await fetch("/api/customer/profile/update", {
        method: "PUT",
        headers: { Authorization: "Bearer " + getToken() },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Profile details updated successfully.");
        setImageFile(null);
        setTimeout(() => router.push("/customer/profile"), 1200);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setSaving(false);
  }

  // Separate action — sends OTP to the NEW email, then redirects to verify
  async function handleChangeEmail() {
    setError("");
    setSuccess("");

    if (email.trim().toLowerCase() === user.email) {
      setError("Enter a different email address to change it.");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await fetch("/api/customer/profile/send-email-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({ newEmail: email.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/customer/verify-otp?email=${encodeURIComponent(data.currentEmail)}&purpose=email_change`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setSendingOtp(false);
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.spinnerWrap}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const currentImage = imagePreview || user.profileImage;
  const emailIsChanged = email.trim().toLowerCase() !== user.email;

  return (
    <div style={styles.page}>
      <button style={styles.backLink} onClick={() => router.push("/customer/profile")}>
        ← Back to Profile
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>Edit Profile</h2>
        <p style={styles.sub}>Update your personal and contact information</p>

        <div style={styles.avatarSection}>
          <div style={styles.avatarWrap} onClick={handleImageClick}>
            {currentImage ? (
              <img src={currentImage} alt="Profile" style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarFallback}>{getInitials(user.name)}</div>
            )}
            <div style={styles.avatarOverlay}>Change</div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <p style={styles.avatarHint}>Click photo to upload a new one (JPG, PNG, WEBP — max 3MB)</p>
        </div>

        <label style={styles.label}>Full Name</label>
        <input
          style={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
        />

        <label style={styles.label}>Mobile Number</label>
        <input
          style={styles.input}
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
          placeholder="10-digit mobile"
          maxLength={10}
        />

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button
          style={{ ...styles.saveButton, ...(saving ? styles.buttonDisabled : {}) }}
          onClick={handleSaveDetails}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {/* Separate section for email — its own OTP-gated action */}
        <div style={styles.emailSection}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
          {emailIsChanged && (
            <p style={styles.warnNote}>
              We'll send a verification code to the new address before it takes effect.
            </p>
          )}
          <button
            style={{
              ...styles.emailButton,
              ...((!emailIsChanged || sendingOtp) ? styles.buttonDisabled : {}),
            }}
            onClick={handleChangeEmail}
            disabled={!emailIsChanged || sendingOtp}
          >
            {sendingOtp ? "Sending OTP..." : "Send Verification Code"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: "560px", margin: "0 auto", padding: "20px 20px 60px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  backLink: { background: "none", border: "none", color: "#1d4ed8", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: "16px" },
  spinnerWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0" },
  spinner: { width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTopColor: "#1d4ed8", borderRadius: "50%", marginBottom: "14px", animation: "spin 0.8s linear infinite" },
  loadingText: { color: "#6b7280", fontSize: "14px" },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "32px 30px", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)" },
  title: { fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 },
  sub: { color: "#6b7280", fontSize: "13.5px", margin: "4px 0 26px" },
  avatarSection: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" },
  avatarWrap: { position: "relative", width: "88px", height: "88px", borderRadius: "50%", cursor: "pointer", overflow: "hidden", boxShadow: "0 4px 12px rgba(29,78,216,0.25)" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarFallback: { width: "100%", height: "100%", background: "linear-gradient(135deg, #1d4ed8, #4f7df9)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "30px" },
  avatarOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "11.5px", fontWeight: 600, textAlign: "center", padding: "5px 0" },
  avatarHint: { fontSize: "12px", color: "#9ca3af", marginTop: "10px", textAlign: "center", maxWidth: "260px" },
  label: { display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" },
  input: { width: "100%", padding: "12px 14px", marginBottom: "6px", borderRadius: "8px", border: "1px solid #d9dee6", fontSize: "14.5px", outline: "none", boxSizing: "border-box", background: "#ffffff", color: "#111827" },
  warnNote: { fontSize: "11.5px", color: "#92620a", marginBottom: "12px", marginTop: "4px" },
  error: { color: "#b3261e", background: "#fceeed", border: "1px solid #f5d0cc", padding: "10px 12px", borderRadius: "8px", marginTop: "14px", fontSize: "13px" },
  success: { color: "#0f7a3d", background: "#e9f8ef", border: "1px solid #bdeccf", padding: "10px 12px", borderRadius: "8px", marginTop: "14px", fontSize: "13px" },
  saveButton: { width: "100%", padding: "13px", background: "#1d4ed8", border: "none", borderRadius: "8px", color: "#fff", fontSize: "14.5px", fontWeight: 600, cursor: "pointer", marginTop: "16px" },
  emailSection: { marginTop: "28px", paddingTop: "24px", borderTop: "1px solid #f0f1f3" },
  emailButton: { width: "100%", padding: "12px", background: "#fff", border: "1px solid #1d4ed8", borderRadius: "8px", color: "#1d4ed8", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", marginTop: "4px" },
  buttonDisabled: { opacity: 0.5, cursor: "not-allowed" },
};