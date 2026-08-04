"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

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

  async function logout() {
    setLoggingOut(true);
    const token = localStorage.getItem("customerToken");

    try {
      if (token) {
        await fetch("/api/customer/logout", {
          method: "POST",
          headers: { Authorization: "Bearer " + token },
        });
      }
    } catch (err) {
      console.log("Logout notify error:", err.message);
    }

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
      not_submitted: { text: "Not submitted", color: "#6b7280", bg: "#f3f4f6" },
      pending: { text: "Pending review", color: "#92620a", bg: "#fdf3e0" },
      approved: { text: "Approved", color: "#0f7a3d", bg: "#e9f8ef" },
      rejected: { text: "Rejected", color: "#b3261e", bg: "#fceeed" },
    };
    return map[status] || map.not_submitted;
  }

  // FIX: was checking kyc.pan / kyc.aadhaar (just presence of a typed-in number),
  // which counted as "complete" even if the user never finished OTP verification.
  // Now checks the actual verification flags instead.
  function calculateCompletion(user) {
    const fields = [
      user.name,
      user.email,
      user.mobile,
      user.dob,
      user.gender,
      user.address,
      user.city,
      user.state,
      user.pincode,
      user.kyc?.aadhaarVerified, // was: user.kyc?.pan
      user.kyc?.panVerified,     // was: user.kyc?.aadhaar
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
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.spinner} />
        <p style={{ color: "#667085", fontSize: "14px", marginTop: "16px", fontFamily: FONT_BODY }}>
          Loading your dashboard…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingPage}>
        <p style={{ color: "#B3261E", fontSize: "14px", fontFamily: FONT_BODY }}>{error}</p>
      </div>
    );
  }

  if (!user) return null;

  const badge = kycBadge(user.kyc?.status);
  const completion = calculateCompletion(user);

  const menuItems = [
    { label: "Dashboard", icon: <IconHome />, path: "/customer/dashboard", active: true },
    { label: "My Profile", icon: <IconUser />, path: "/customer/profile" },
    { label: "My KYC", icon: <IconShield />, path: "/customer/kyc" },
    { label: "Wallet", icon: <IconWallet />, path: "/customer/wallet" },
    { label: "Transactions", icon: <IconList />, path: "/customer/transactions" },
    { label: "Support", icon: <IconSupport />, path: "/customer/support" },
    { label: "Settings", icon: <IconSettings />, path: "/customer/settings" },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        html, body { overflow-x: hidden; }
        .bc-main { min-width: 0; }
      `}</style>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogoWrap}>
          <img src="/BizCred-logo.png" alt="BizCred" style={styles.sidebarLogo} />
        </div>

        <div style={styles.menuList}>
          {menuItems.map((item) => (
            <div
              key={item.label}
              style={item.active ? styles.menuActive : styles.menu}
              onClick={() => !item.active && router.push(item.path)}
            >
              <span style={{ ...styles.menuIcon, ...(item.active ? styles.menuIconActive : {}) }}>
                {item.icon}
              </span>
              {item.label}
            </div>
          ))}
        </div>

        <button
          style={{ ...styles.logout, ...(loggingOut ? styles.logoutDisabled : {}) }}
          onClick={logout}
          disabled={loggingOut}
        >
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>

      {/* MAIN */}
      <div className="bc-main" style={styles.main}>
        <div style={styles.top}>
          <div style={{ minWidth: 0 }}>
            <h1 style={styles.welcomeTitle}>Welcome back, {user.name}</h1>
            <p style={styles.welcomeSub}>Here's what's happening with your account</p>
          </div>

          <div style={styles.topRight}>
            <span style={{ ...styles.statusPill, color: badge.color, background: badge.bg }}>
              KYC · {badge.text}
            </span>

            <div
              style={styles.avatar}
              onClick={() => router.push("/customer/profile")}
              title="Go to your profile"
            >
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" style={styles.avatarImg} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div style={styles.cards}>
          <div style={styles.cardDark}>
            <div style={styles.cardDarkPattern} />
            <div style={styles.cardDarkTop}>
              <span style={styles.cardLabelChip}>WALLET BALANCE</span>
              <span style={styles.cardWalletIcon}><IconWallet /></span>
            </div>
            <h1 style={styles.cardValueLight}>
              ₹{(wallet?.balance || 0).toLocaleString("en-IN")}
            </h1>
            <div style={styles.cardDivider} />
            <div style={styles.cardFootRow}>
              <span
                style={{
                  ...styles.cardStatusDot,
                  background: wallet?.status === "active" ? "#3DDC84" : "#F3A6A0",
                }}
              />
              <p style={styles.cardFootLight}>
                {wallet?.status === "active" ? "Active" : "Inactive"} · {wallet?.currency || "INR"}
              </p>
            </div>
          </div>

          <div style={styles.cardWhite}>
            <p style={styles.cardLabelDark}>Account status</p>
            <h2 style={styles.cardValueDark}>
              {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "Active"}
            </h2>
            <p style={styles.cardFootDark}>Member since {formatDate(user.createdAt)}</p>
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
              <h3 style={styles.panelTitle}>Personal information</h3>
              <span style={styles.panelLink} onClick={() => router.push("/customer/profile")}>
                Edit
              </span>
            </div>
            <div style={styles.infoGrid}>
              <InfoRow label="Full name" value={user.name} />
              <InfoRow label="Date of birth" value={formatDate(user.dob)} />
              <InfoRow label="Gender" value={user.gender || "—"} />
              <InfoRow label="Address" value={user.address || "—"} />
              <InfoRow label="City" value={user.city || "—"} />
              <InfoRow label="State" value={user.state || "—"} />
              <InfoRow label="Pincode" value={user.pincode || "—"} />
            </div>
          </div>

          <div style={styles.panelCard}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>KYC details</h3>
              <span style={styles.panelLink} onClick={() => router.push("/customer/kyc")}>
                {user.kyc?.status === "not_submitted" ? "Complete" : "View"}
              </span>
            </div>
            <div style={styles.infoGrid}>
              <InfoRow
                label="Aadhaar number"
                value={
                  <>
                    {maskAadhaar(user.kyc?.aadhaar)}{" "}
                    {user.kyc?.aadhaarVerified ? (
                      <span style={styles.miniBadgeGreen}>Verified</span>
                    ) : user.kyc?.aadhaar ? (
                      <span style={styles.miniBadgeAmber}>Unverified</span>
                    ) : null}
                  </>
                }
                mono
              />
              <InfoRow
                label="PAN number"
                value={
                  <>
                    {user.kyc?.pan || "Not added"}{" "}
                    {user.kyc?.panVerified ? (
                      <span style={styles.miniBadgeGreen}>Verified</span>
                    ) : user.kyc?.pan ? (
                      <span style={styles.miniBadgeAmber}>Unverified</span>
                    ) : null}
                  </>
                }
                mono
              />
              <InfoRow label="PAN name" value={user.kyc?.panName || "—"} />
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
            <h3 style={styles.panelTitle}>Profile completion</h3>
            <span style={styles.progressPercent}>{completion}%</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${completion}%` }} />
          </div>
          <p style={styles.progressNote}>
            {completion === 100
              ? "Your profile and KYC are fully complete."
              : "Complete your profile and KYC (including Aadhaar & PAN verification) to unlock full wallet and transaction limits."}
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <h3 style={styles.quickTitle}>Quick actions</h3>
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

function InfoRow({ label, value, mono }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={{ ...styles.infoValue, ...(mono ? { fontFamily: FONT_MONO, fontSize: "12.5px" } : {}) }}>
        {value}
      </span>
    </div>
  );
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function IconHome() {
  return (
    <svg {...iconProps}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  );
}
function IconShield() {
  return (
    <svg {...iconProps}>
      <path d="M12 3.5 19 6v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9.5 12.2l1.8 1.8 3.2-3.4" />
    </svg>
  );
}
function IconWallet() {
  return (
    <svg {...iconProps}>
      <rect x="3.5" y="6.5" width="17" height="12" rx="2" />
      <path d="M3.5 10h17" />
      <circle cx="16" cy="14" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconList() {
  return (
    <svg {...iconProps}>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconSupport() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M6 6l3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="2.8" />
      <path d="M12 3.5v2M12 18.5v2M4.9 6.9l1.4 1.4M17.7 15.7l1.4 1.4M3.5 12h2M18.5 12h2M4.9 17.1l1.4-1.4M17.7 8.3l1.4-1.4" />
    </svg>
  );
}

const FONT_BODY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_DISPLAY = "'Source Serif 4', Georgia, serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";
const ACCENT = "#2451B8";

const styles = {
  page: { display: "flex", background: "#F7F8FA", minHeight: "100vh", fontFamily: FONT_BODY, overflowX: "hidden" },
  loadingPage: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#fff" },
  spinner: { width: "28px", height: "28px", border: "3px solid #E5E7EB", borderTopColor: ACCENT, borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  sidebar: {
    width: "252px",
    flexShrink: 0,
    background: "linear-gradient(180deg, #0E1420 0%, #161D2C 100%)",
    padding: "24px 18px",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  sidebarLogoWrap: {
    background: "#EEF0F4",
    border: "1px solid #DDE1E8",
    borderRadius: "8px",
    padding: "10px 14px",
    display: "inline-flex",
    marginBottom: "26px",
  },
  sidebarLogo: { height: "22px", width: "auto", objectFit: "contain", display: "block" },

  menuList: { display: "flex", flexDirection: "column", gap: "2px" },
  menu: { display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "8px", cursor: "pointer", color: "#9AA5BD", fontSize: "13.5px", fontWeight: 500 },
  menuActive: { display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "8px", background: "rgba(36,81,184,0.18)", color: "#FFFFFF", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" },
  menuIcon: { display: "flex", alignItems: "center", color: "#6B7A9C" },
  menuIconActive: { color: "#7FA1F0" },

  logout: { marginTop: "auto", width: "100%", padding: "11px", background: "transparent", color: "#F3A6A0", border: "1px solid rgba(243,166,160,0.35)", borderRadius: "8px", cursor: "pointer", fontSize: "13.5px", fontWeight: 600 },
  logoutDisabled: { opacity: 0.6, cursor: "not-allowed" },

  main: { flex: 1, minWidth: 0, padding: "40px 44px", maxWidth: "1140px" },
  top: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "30px", flexWrap: "wrap" },
  welcomeTitle: { margin: 0, fontFamily: FONT_DISPLAY, fontSize: "clamp(19px, 2.4vw, 26px)", fontWeight: 600, color: "#101828", lineHeight: 1.25, wordBreak: "break-word" },
  welcomeSub: { margin: "6px 0 0", color: "#667085", fontSize: "13.5px" },
  topRight: { display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 },
  statusPill: { fontFamily: FONT_MONO, fontSize: "10.5px", fontWeight: 500, padding: "6px 12px", borderRadius: "20px", letterSpacing: "0.03em", textTransform: "uppercase", whiteSpace: "nowrap" },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: ACCENT,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "16px",
    flexShrink: 0,
    cursor: "pointer",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },

  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" },
  cardDark: {
    position: "relative",
    overflow: "hidden",
    padding: "22px",
    borderRadius: "14px",
    background: "linear-gradient(155deg, #10192B 0%, #24365F 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  cardDarkPattern: {
    position: "absolute",
    top: "-40px",
    right: "-40px",
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(88,130,224,0.35) 0%, rgba(88,130,224,0) 70%)",
    pointerEvents: "none",
  },
  cardDarkTop: { display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" },
  cardLabelChip: {
    fontFamily: FONT_MONO,
    fontSize: "10px",
    fontWeight: 600,
    color: "#E7EEFF",
    background: "rgba(127,161,240,0.22)",
    padding: "4px 9px",
    borderRadius: "6px",
    letterSpacing: "0.05em",
  },
  cardWalletIcon: { color: "#7FA1F0", display: "flex" },
  cardWhite: { padding: "22px", borderRadius: "14px", background: "#fff", border: "1px solid #E4E7EC" },
  cardLabelDark: { margin: 0, fontFamily: FONT_MONO, fontSize: "10.5px", color: "#667085", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" },
  cardValueLight: { margin: "16px 0 0", fontSize: "32px", fontWeight: 700, color: "#FFFFFF", position: "relative", letterSpacing: "-0.01em" },
  cardValueDark: { margin: "10px 0 0", fontSize: "18px", fontWeight: 700, color: "#101828" },
  cardValueSmall: { margin: "10px 0 0", fontSize: "14.5px", fontWeight: 600, color: "#101828", wordBreak: "break-word" },
  cardDivider: { height: "1px", background: "rgba(255,255,255,0.1)", margin: "16px 0 12px" },
  cardFootRow: { display: "flex", alignItems: "center", gap: "7px", position: "relative" },
  cardStatusDot: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 },
  cardFootLight: { margin: 0, fontSize: "12.5px", color: "#C3CFEA" },
  cardFootDark: { margin: "6px 0 0", fontSize: "12px", color: "#9CA3AF" },

  sectionRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" },
  panelCard: { background: "#fff", border: "1px solid #E4E7EC", borderRadius: "12px", padding: "20px", minWidth: 0 },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" },
  panelTitle: { margin: 0, fontFamily: FONT_MONO, fontSize: "11.5px", fontWeight: 500, color: "#344054", textTransform: "uppercase", letterSpacing: "0.04em" },
  panelLink: { fontSize: "12.5px", fontWeight: 600, color: ACCENT, cursor: "pointer" },
  infoGrid: { display: "flex", flexDirection: "column", gap: "10px" },
  infoRow: { display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "13.5px", borderBottom: "1px solid #F3F4F6", paddingBottom: "9px" },
  infoLabel: { color: "#667085", flexShrink: 0 },
  infoValue: { color: "#101828", fontWeight: 500, textAlign: "right", wordBreak: "break-word" },
  inlineBadge: { fontFamily: FONT_MONO, fontSize: "10.5px", fontWeight: 500, padding: "3px 9px", borderRadius: "20px", textTransform: "uppercase" },

  // NEW: small inline verification tags next to Aadhaar/PAN values
  miniBadgeGreen: {
    fontSize: "9.5px", fontWeight: 700, color: "#0f7a3d", background: "#e9f8ef",
    padding: "2px 6px", borderRadius: "10px", marginLeft: "4px", verticalAlign: "middle",
  },
  miniBadgeAmber: {
    fontSize: "9.5px", fontWeight: 700, color: "#92620a", background: "#fdf3e0",
    padding: "2px 6px", borderRadius: "10px", marginLeft: "4px", verticalAlign: "middle",
  },

  progressCard: { background: "#fff", border: "1px solid #E4E7EC", borderRadius: "12px", padding: "20px", marginBottom: "28px" },
  progressPercent: { fontFamily: FONT_MONO, fontSize: "14px", fontWeight: 500, color: ACCENT },
  progressTrack: { height: "8px", background: "#EEF1F5", borderRadius: "20px", overflow: "hidden" },
  progressFill: { height: "100%", background: ACCENT, borderRadius: "20px", transition: "width 0.4s ease" },
  progressNote: { marginTop: "10px", marginBottom: 0, fontSize: "12.5px", color: "#9CA3AF" },

  quickTitle: { fontFamily: FONT_MONO, fontSize: "11.5px", fontWeight: 500, color: "#344054", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" },
  quickGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px" },
  quick: { background: "#fff", border: "1px solid #E4E7EC", padding: "22px", textAlign: "center", borderRadius: "12px", cursor: "pointer" },
  quickIcon: { display: "flex", justifyContent: "center", marginBottom: "10px", color: ACCENT },
  quickLabel: { fontSize: "13px", fontWeight: 600, color: "#374151" },
};