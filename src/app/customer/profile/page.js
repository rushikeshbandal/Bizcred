"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const token = localStorage.getItem("customerToken");
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
    } catch (err) {
      setError("Unable to load profile. Please try again.");
    }
    setLoading(false);
  }

  function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.spinnerWrap}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>{error}</div>
      </div>
    );
  }

  const kyc = user?.kyc || {};
  const isAadhaarVerified = Boolean(kyc.aadhaarVerified);
  const isPanVerified = Boolean(kyc.panVerified);

  return (
    <div style={styles.page}>
      {/* Back to Dashboard */}
      <button style={styles.backLink} onClick={() => router.push("/customer/dashboard")}>
        ← Back to Dashboard
      </button>

      {/* ===== HEADER CARD ===== */}
      <div style={styles.headerCard}>
        <div style={styles.headerTop}>
          <div style={styles.avatarWrap}>
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" style={styles.avatarPhoto} />
            ) : (
              <div style={styles.avatar}>{getInitials(user?.name)}</div>
            )}
          </div>

          <div style={styles.headerInfo}>
            <div style={styles.nameRow}>
              <h1 style={styles.name}>{user?.name || "—"}</h1>
              <span
                style={{
                  ...styles.statusBadge,
                  ...(user?.status === "active" ? styles.badgeGreen : styles.badgeRed),
                }}
              >
                {user?.status === "active" ? "Active" : user?.status || "Unknown"}
              </span>
            </div>
            <p style={styles.email}>{user?.email}</p>
            <p style={styles.memberSince}>Member since {formatDate(user?.createdAt)}</p>
          </div>

          <button style={styles.editButton} onClick={() => router.push("/customer/profile/edit")}>
            Edit Profile
          </button>
        </div>
      </div>

      {/* ===== KYC STATUS STRIP ===== */}
      <div style={styles.kycStrip}>
        <KycPill label="Aadhaar" verified={isAadhaarVerified} onAction={() => router.push("/customer/kyc")} />
        <KycPill label="PAN" verified={isPanVerified} onAction={() => router.push("/customer/kyc")} />
      </div>

      {/* ===== INFO GRID ===== */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Personal Details</h3>
          <InfoRow label="Full Name" value={user?.name} />
          <InfoRow label="Date of Birth" value={formatDate(user?.dob)} />
          <InfoRow label="Gender" value={user?.gender} />
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Contact Details</h3>
          <InfoRow label="Email Address" value={user?.email} />
          <InfoRow label="Mobile Number" value={user?.mobile} />
        </div>

        {/* Address — proper 3-column grid */}
        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <h3 style={styles.cardTitle}>Address</h3>
          <InfoRow label="Address" value={user?.address} />
          <div style={styles.fieldGrid}>
            <Field label="City" value={user?.city} />
            <Field label="State" value={user?.state} />
            <Field label="Pincode" value={user?.pincode} />
          </div>
        </div>

        {/* KYC Documents — same fixed grid */}
        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <h3 style={styles.cardTitle}>KYC Documents</h3>
          <div style={styles.fieldGrid}>
            <Field label="Aadhaar Number" value={kyc.aadhaar ? `XXXX XXXX ${kyc.aadhaar}` : "Not provided"} />
            <Field label="PAN Number" value={kyc.pan || "Not provided"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value || "—"}</span>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <span style={styles.fieldValue}>{value || "—"}</span>
    </div>
  );
}

function KycPill({ label, verified, onAction }) {
  return (
    <div style={{ ...styles.pill, ...(verified ? styles.pillVerified : styles.pillPending) }}>
      <span style={styles.pillIcon}>{verified ? "✓" : "!"}</span>
      <span style={styles.pillLabel}>{label}</span>
      <span style={styles.pillStatus}>{verified ? "Verified" : "Pending"}</span>
      {!verified && (
        <span style={styles.pillAction} onClick={onAction}>
          Complete
        </span>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "980px",
    margin: "0 auto",
    padding: "20px 20px 60px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  backLink: {
    background: "none", border: "none", color: "#1d4ed8", fontSize: "13.5px",
    fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: "16px",
  },

  spinnerWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0" },
  spinner: {
    width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTopColor: "#1d4ed8",
    borderRadius: "50%", marginBottom: "14px", animation: "spin 0.8s linear infinite",
  },
  loadingText: { color: "#6b7280", fontSize: "14px" },

  errorBox: {
    background: "#fceeed", border: "1px solid #f5d0cc", color: "#b3261e",
    padding: "16px", borderRadius: "10px", textAlign: "center", fontSize: "14px",
  },

  headerCard: {
    background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)",
    border: "1px solid #e5e7eb", borderRadius: "16px", padding: "28px 30px", marginBottom: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
  },
  headerTop: { display: "flex", alignItems: "center", gap: "20px" },
  avatarWrap: { flexShrink: 0 },
  avatar: {
    width: "72px", height: "72px", borderRadius: "50%",
    background: "linear-gradient(135deg, #1d4ed8, #4f7df9)", color: "#fff", fontSize: "26px", fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(29,78,216,0.25)",
  },
  // NEW: real uploaded photo, same size/shadow as the initials fallback
  avatarPhoto: {
    width: "72px", height: "72px", borderRadius: "50%", objectFit: "cover",
    boxShadow: "0 4px 12px rgba(29,78,216,0.25)",
  },
  headerInfo: { flex: 1, minWidth: 0 },
  nameRow: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  name: { fontSize: "21px", fontWeight: 700, color: "#111827", margin: 0 },
  statusBadge: { fontSize: "11.5px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.3px" },
  badgeGreen: { background: "#e9f8ef", color: "#0f7a3d" },
  badgeRed: { background: "#fceeed", color: "#b3261e" },
  email: { color: "#4b5563", fontSize: "14px", margin: "4px 0 2px" },
  memberSince: { color: "#9ca3af", fontSize: "12.5px", margin: 0 },
  editButton: {
    background: "#1d4ed8", color: "#fff", border: "none", borderRadius: "8px",
    padding: "10px 18px", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
  },

  kycStrip: { display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap" },
  pill: {
    display: "flex", alignItems: "center", gap: "10px", border: "1px solid #e5e7eb", borderRadius: "12px",
    padding: "12px 16px", flex: "1 1 220px", background: "#fff",
  },
  pillVerified: { borderColor: "#bdeccf", background: "#f3fdf7" },
  pillPending: { borderColor: "#fde3b0", background: "#fffaf0" },
  pillIcon: {
    width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0, background: "#fff",
  },
  pillLabel: { fontWeight: 600, fontSize: "13.5px", color: "#111827" },
  pillStatus: { fontSize: "12px", color: "#6b7280", flex: 1 },
  pillAction: { fontSize: "12.5px", fontWeight: 700, color: "#1d4ed8", cursor: "pointer", whiteSpace: "nowrap" },

  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  card: {
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "22px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.03)", minWidth: 0,
  },
  cardTitle: { fontSize: "14.5px", fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: "14px" },
  infoRow: {
    display: "flex", justifyContent: "space-between", alignItems: "baseline",
    padding: "9px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13.5px", gap: "12px",
  },
  infoLabel: { color: "#6b7280", flexShrink: 0 },
  infoValue: { color: "#111827", fontWeight: 500, textAlign: "right" },

  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "16px",
    marginTop: "10px",
  },
  field: { display: "flex", flexDirection: "column", gap: "4px" },
  fieldLabel: { fontSize: "12px", color: "#6b7280" },
  fieldValue: { fontSize: "14px", fontWeight: 600, color: "#111827" },
};