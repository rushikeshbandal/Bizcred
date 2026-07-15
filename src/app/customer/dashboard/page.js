"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      router.push("/customer/login");
      return;
    }

    try {
      const [profileRes, walletRes] = await Promise.all([
        fetch("/api/customer/me", {
          headers: { Authorization: "Bearer " + token },
        }),
        fetch("/api/customer/wallet", {
          headers: { Authorization: "Bearer " + token },
        }),
      ]);

      const profileData = await profileRes.json();
      const walletData = await walletRes.json();

      if (!profileData.success) {
        localStorage.removeItem("customerToken");
        router.push("/customer/login");
        return;
      }

      setUser(profileData.user);
      setWallet(walletData.success ? walletData.wallet : { balance: 0, currency: "INR" });
    } catch (err) {
      setError("Unable to load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("customerToken");
    router.push("/customer/login");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function kycBadge(status) {
    const map = {
      not_submitted: { text: "Not Submitted", color: "#6b7280", bg: "#f3f4f6" },
      pending: { text: "Pending Review", color: "#92620a", bg: "#fdf3e0" },
      approved: { text: "Approved", color: "#0f7a3d", bg: "#e9f8ef" },
      rejected: { text: "Rejected", color: "#b3261e", bg: "#fceeed" },
    };
    return map[status] || map.not_submitted;
  }

  function calculateCompletion(user) {
    const fields = [
      user.name, user.email, user.mobile, user.dob, user.gender,
      user.address, user.city, user.state, user.pincode,
      user.kyc?.pan, user.kyc?.aadhaar,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }

  function maskAadhaar(aadhaar) {
    if (!aadhaar) return "Not added";
    if (aadhaar.length < 4) return aadhaar;
    return "XXXX XXXX " + aadhaar.slice(-4);
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.spinner} />
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "16px" }}>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingPage}>
        <p style={{ color: "#b3261e", fontSize: "14px" }}>{error}</p>
      </div>
    );
  }

  if (!user) return null;

  const badge = kycBadge(user.kyc?.status);

  const menuItems = [
    { label: "Dashboard", icon: "🏠", path: "/customer/dashboard", active: true },
    { label: "My Profile", icon: "👤", path: "/customer/profile" },
    { label: "My KYC", icon: "🧾", path: "/customer/kyc" },
    { label: "Wallet", icon: "💰", path: "/customer/wallet" },
    { label: "Transactions", icon: "📜", path: "/customer/transactions" },
    { label: "Support", icon: "🎫", path: "/customer/support" },
    { label: "Settings", icon: "⚙", path: "/customer/settings" },
  ];

  return (
    <div style={styles.page}>
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <img src="/BizCred-logo.png" alt="BizCred" style={styles.logo} />

        {menuItems.map((item) => (
          <div
            key={item.label}
            style={item.active ? styles.menuActive : styles.menu}
            onClick={() => !item.active && router.push(item.path)}
          >
            <span style={styles.menuIcon}>{item.icon}</span>
            {item.label}
          </div>
        ))}

        <button style={styles.logout} onClick={logout}>
          Sign Out
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.top}>
          <div>
            <h1 style={styles.welcomeTitle}>Welcome back, {user.name}</h1>
            <p style={styles.welcomeSub}>Here's what's happening with your account</p>
          </div>

          <div style={styles.topRight}>
            <span style={{ ...styles.statusPill, color: badge.color, background: badge.bg }}>
              KYC: {badge.text}
            </span>
            <div style={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div style={styles.cards}>
          <div style={styles.cardDark}>
            <p style={styles.cardLabel}>Wallet Balance</p>
            <h1 style={styles.cardValueLight}>
              ₹{(wallet?.balance || 0).toLocaleString("en-IN")}
            </h1>
            <p style={styles.cardFootLight}>
              {wallet?.status === "active" ? "Active" : "Inactive"} · {wallet?.currency || "INR"}
            </p>
          </div>

          <div style={styles.cardWhite}>
            <p style={styles.cardLabelDark}>Account Status</p>
            <h2 style={styles.cardValueDark}>
              {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "Active"}
            </h2>
            <p style={styles.cardFootDark}>Since {formatDate(user.createdAt)}</p>
          </div>

          <div style={styles.cardWhite}>
            <p style={styles.cardLabelDark}>Email</p>
            <h3 style={styles.cardValueSmall}>{user.email}</h3>
            <p style={styles.cardFootDark}>
              {user.isEmailVerified ? "Verified" : "Not verified"}
            </p>
          </div>

          <div style={styles.cardWhite}>
            <p style={styles.cardLabelDark}>Mobile</p>
            <h3 style={styles.cardValueSmall}>{user.mobile}</h3>
            <p style={styles.cardFootDark}>Registered number</p>
          </div>
        </div>

        {/* PROFILE + KYC PANELS */}
        <div style={styles.sectionRow}>
          <div style={styles.panelCard}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>Personal Information</h3>
              <span style={styles.panelLink} onClick={() => router.push("/customer/profile")}>
                Edit
              </span>
            </div>
            <div style={styles.infoGrid}>
              <InfoRow label="Full Name" value={user.name} />
              <InfoRow label="Date of Birth" value={formatDate(user.dob)} />
              <InfoRow label="Gender" value={user.gender || "—"} />
              <InfoRow label="Address" value={user.address || "—"} />
              <InfoRow label="City" value={user.city || "—"} />
              <InfoRow label="State" value={user.state || "—"} />
              <InfoRow label="Pincode" value={user.pincode || "—"} />
            </div>
          </div>

          <div style={styles.panelCard}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>KYC Details</h3>
              <span style={styles.panelLink} onClick={() => router.push("/customer/kyc")}>
                {user.kyc?.status === "not_submitted" ? "Complete" : "View"}
              </span>
            </div>
            <div style={styles.infoGrid}>
              <InfoRow label="PAN Number" value={user.kyc?.pan || "Not added"} />
              <InfoRow label="PAN Name" value={user.kyc?.panName || "—"} />
              <InfoRow label="Aadhaar Number" value={maskAadhaar(user.kyc?.aadhaar)} />
              <InfoRow
                label="Status"
                value={
                  <span style={{ ...styles.inlineBadge, color: badge.color, background: badge.bg }}>
                    {badge.text}
                  </span>
                }
              />
            </div>
          </div>
        </div>

        {/* PROFILE COMPLETION */}
        <div style={styles.progressCard}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Profile Completion</h3>
            <span style={styles.progressPercent}>{calculateCompletion(user)}%</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${calculateCompletion(user)}%` }} />
          </div>
          <p style={styles.progressNote}>
            Complete your profile and KYC to unlock full wallet and transaction limits.
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <h3 style={styles.quickTitle}>Quick Actions</h3>
        <div style={styles.quickGrid}>
          {menuItems.filter((i) => !i.active).map((item) => (
            <div key={item.label} style={styles.quick} onClick={() => router.push(item.path)}>
              <span style={styles.quickIcon}>{item.icon}</span>
              <span style={styles.quickLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

const styles = {
  page: { display: "flex", background: "#f7f9fc", minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  loadingPage: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#ffffff" },
  spinner: { width: "28px", height: "28px", border: "3px solid #e5e7eb", borderTopColor: "#1d4ed8", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  sidebar: { width: "250px", background: "#ffffff", borderRight: "1px solid #e5e7eb", padding: "24px 18px", display: "flex", flexDirection: "column" },
  logo: { width: "140px", marginBottom: "28px" },
  menu: { display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", marginBottom: "4px", borderRadius: "8px", cursor: "pointer", color: "#4b5563", fontSize: "14px", fontWeight: 500 },
  menuActive: { display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px", marginBottom: "4px", borderRadius: "8px", background: "#eff4ff", color: "#1d4ed8", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  menuIcon: { fontSize: "15px", width: "18px", display: "inline-block" },
  logout: { marginTop: "auto", width: "100%", padding: "11px", background: "#ffffff", color: "#b3261e", border: "1px solid #f5d0cc", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600 },
  main: { flex: 1, padding: "36px 40px", maxWidth: "1100px" },
  top: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" },
  welcomeTitle: { margin: 0, fontSize: "22px", fontWeight: 700, color: "#111827" },
  welcomeSub: { margin: "4px 0 0", color: "#6b7280", fontSize: "13.5px" },
  topRight: { display: "flex", alignItems: "center", gap: "14px" },
  statusPill: { fontSize: "11.5px", fontWeight: 700, padding: "6px 12px", borderRadius: "20px", letterSpacing: "0.2px" },
  avatar: { width: "44px", height: "44px", borderRadius: "50%", background: "#1d4ed8", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "17px" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" },
  cardDark: { padding: "22px", borderRadius: "12px", background: "#18936c", color: "#fff" },
  cardWhite: { padding: "22px", borderRadius: "12px", background: "#fff", border: "1px solid #e5e7eb" },
  cardLabel: { margin: 0, fontSize: "12.5px", color: "#9ca3af", fontWeight: 600 },
  cardLabelDark: { margin: 0, fontSize: "12.5px", color: "#6b7280", fontWeight: 600 },
  cardValueLight: { margin: "8px 0 0", fontSize: "26px", fontWeight: 700 },
  cardValueDark: { margin: "8px 0 0", fontSize: "19px", fontWeight: 700, color: "#111827" },
  cardValueSmall: { margin: "8px 0 0", fontSize: "15px", fontWeight: 600, color: "#111827", wordBreak: "break-word" },
  cardFootLight: { margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" },
  cardFootDark: { margin: "4px 0 0", fontSize: "12px", color: "#9ca3af" },
  sectionRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" },
  panelCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" },
  panelTitle: { margin: 0, fontSize: "15px", fontWeight: 700, color: "#111827" },
  panelLink: { fontSize: "12.5px", fontWeight: 600, color: "#1d4ed8", cursor: "pointer" },
  infoGrid: { display: "flex", flexDirection: "column", gap: "10px" },
  infoRow: { display: "flex", justifyContent: "space-between", fontSize: "13.5px", borderBottom: "1px solid #f3f4f6", paddingBottom: "8px" },
  infoLabel: { color: "#6b7280" },
  infoValue: { color: "#111827", fontWeight: 500, textAlign: "right" },
  inlineBadge: { fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "20px" },
  progressCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", marginBottom: "28px" },
  progressPercent: { fontSize: "15px", fontWeight: 700, color: "#1d4ed8" },
  progressTrack: { height: "10px", background: "#eef1f5", borderRadius: "20px", overflow: "hidden" },
  progressFill: { height: "100%", background: "#1d4ed8", borderRadius: "20px", transition: "width 0.4s ease" },
  progressNote: { marginTop: "10px", marginBottom: 0, fontSize: "12.5px", color: "#9ca3af" },
  quickTitle: { fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "12px" },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px" },
  quick: { background: "#fff", border: "1px solid #e5e7eb", padding: "22px", textAlign: "center", borderRadius: "12px", cursor: "pointer" },
  quickIcon: { fontSize: "22px", display: "block", marginBottom: "8px" },
  quickLabel: { fontSize: "13px", fontWeight: 600, color: "#374151" },
};