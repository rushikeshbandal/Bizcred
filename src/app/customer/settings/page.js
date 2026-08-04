"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerSettings() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
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
        localStorage.removeItem("customerToken");
        router.push("/customer/login");
        return;
      }

      setUser(data.user);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
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

  async function submitPasswordChange() {
    setPwError("");
    setPwSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("Please fill all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwLoading(true);
    const token = localStorage.getItem("customerToken");

    try {
      const res = await fetch("/api/customer/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setPwSuccess("Password updated. A confirmation email has been sent.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setPwError("Something went wrong. Please try again.");
    }

    setPwLoading(false);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.spinner} />
        <p style={{ color: "#667085", fontSize: "14px", marginTop: "16px", fontFamily: FONT_BODY }}>
          Loading settings…
        </p>
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { label: "Dashboard", icon: <IconHome />, path: "/customer/dashboard" },
    { label: "My Profile", icon: <IconUser />, path: "/customer/profile" },
    { label: "My KYC", icon: <IconShield />, path: "/customer/kyc" },
    { label: "Wallet", icon: <IconWallet />, path: "/customer/wallet" },
    { label: "Transactions", icon: <IconList />, path: "/customer/transactions" },
    { label: "Support", icon: <IconSupport />, path: "/customer/support" },
    { label: "Settings", icon: <IconSettings />, path: "/customer/settings", active: true },
  ];

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,500;8..60,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        html, body { overflow-x: hidden; }
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
        <button style={styles.logout} onClick={logout}>
          Sign out
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <div style={styles.top}>
          <h1 style={styles.pageTitle}>Settings</h1>
          <p style={styles.pageSub}>Manage your account security and preferences</p>
        </div>

        {/* ACCOUNT OVERVIEW */}
        <div style={styles.panelCard}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Account overview</h3>
            <span style={styles.panelLink} onClick={() => router.push("/customer/profile")}>
              Edit profile
            </span>
          </div>
          <div style={styles.infoGrid}>
            <InfoRow label="Full name" value={user.name} />
            <InfoRow label="Email address" value={user.email} />
            <InfoRow label="Mobile number" value={user.mobile} />
            <InfoRow label="Account created" value={formatDate(user.createdAt)} />
          </div>
        </div>

        {/* CHANGE PASSWORD */}
        <div style={styles.panelCard}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Change password</h3>
          </div>
          <p style={styles.sectionNote}>
            You'll receive an email confirmation whenever your password is changed.
          </p>

          <label style={styles.label}>Current password</label>
          <input
            type="password"
            style={styles.input}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>New password</label>
              <input
                type="password"
                style={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Confirm new password</label>
              <input
                type="password"
                style={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          {pwError && <p style={styles.errorNote}>{pwError}</p>}
          {pwSuccess && <p style={styles.successNote}>{pwSuccess}</p>}

          <button
            style={{ ...styles.button, ...(pwLoading ? styles.buttonDisabled : {}) }}
            onClick={submitPasswordChange}
            disabled={pwLoading}
          >
            {pwLoading ? "Updating…" : "Update password"}
          </button>
        </div>

        {/* SECURITY NOTIFICATIONS (informational — always on) */}
        <div style={styles.panelCard}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Login security</h3>
          </div>
          <div style={styles.notifRow}>
            <div>
              <p style={styles.notifTitle}>Sign-in email alerts</p>
              <p style={styles.notifSub}>
                We email you every time your account is signed into or out of, with device and location details.
              </p>
            </div>
            <span style={styles.alwaysOnPill}>Always on</span>
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
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

const iconProps = {
  width: 18, height: 18, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round",
};
function IconHome() { return (<svg {...iconProps}><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1v-9" /></svg>); }
function IconUser() { return (<svg {...iconProps}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>); }
function IconShield() { return (<svg {...iconProps}><path d="M12 3.5 19 6v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9.5 12.2l1.8 1.8 3.2-3.4" /></svg>); }
function IconWallet() { return (<svg {...iconProps}><rect x="3.5" y="6.5" width="17" height="12" rx="2" /><path d="M3.5 10h17" /><circle cx="16" cy="14" r="1.1" fill="currentColor" stroke="none" /></svg>); }
function IconList() { return (<svg {...iconProps}><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" /></svg>); }
function IconSupport() { return (<svg {...iconProps}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.2" /><path d="M6 6l3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5" /></svg>); }
function IconSettings() { return (<svg {...iconProps}><circle cx="12" cy="12" r="2.8" /><path d="M12 3.5v2M12 18.5v2M4.9 6.9l1.4 1.4M17.7 15.7l1.4 1.4M3.5 12h2M18.5 12h2M4.9 17.1l1.4-1.4M17.7 8.3l1.4-1.4" /></svg>); }

const FONT_BODY = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_MONO = "'IBM Plex Mono', ui-monospace, monospace";
const ACCENT = "#2451B8";

const styles = {
  page: { display: "flex", background: "#F7F8FA", minHeight: "100vh", fontFamily: FONT_BODY, overflowX: "hidden" },
  loadingPage: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#fff" },
  spinner: { width: "28px", height: "28px", border: "3px solid #E5E7EB", borderTopColor: ACCENT, borderRadius: "50%", animation: "spin 0.8s linear infinite" },

  sidebar: { width: "252px", flexShrink: 0, background: "linear-gradient(180deg, #0E1420 0%, #161D2C 100%)", padding: "24px 18px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" },
  sidebarLogoWrap: { background: "#EEF0F4", border: "1px solid #DDE1E8", borderRadius: "8px", padding: "10px 14px", display: "inline-flex", marginBottom: "26px" },
  sidebarLogo: { height: "22px", width: "auto", objectFit: "contain", display: "block" },
  menuList: { display: "flex", flexDirection: "column", gap: "2px" },
  menu: { display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "8px", cursor: "pointer", color: "#9AA5BD", fontSize: "13.5px", fontWeight: 500 },
  menuActive: { display: "flex", alignItems: "center", gap: "12px", padding: "11px 14px", borderRadius: "8px", background: "rgba(36,81,184,0.18)", color: "#FFFFFF", fontSize: "13.5px", fontWeight: 600, cursor: "pointer" },
  menuIcon: { display: "flex", alignItems: "center", color: "#6B7A9C" },
  menuIconActive: { color: "#7FA1F0" },
  logout: { marginTop: "auto", width: "100%", padding: "11px", background: "transparent", color: "#F3A6A0", border: "1px solid rgba(243,166,160,0.35)", borderRadius: "8px", cursor: "pointer", fontSize: "13.5px", fontWeight: 600 },

  main: { flex: 1, minWidth: 0, padding: "40px 44px", maxWidth: "760px" },
  top: { marginBottom: "24px" },
  pageTitle: { margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "26px", fontWeight: 600, color: "#101828" },
  pageSub: { margin: "6px 0 0", color: "#667085", fontSize: "13.5px" },

  panelCard: { background: "#fff", border: "1px solid #E4E7EC", borderRadius: "12px", padding: "24px", marginBottom: "20px" },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  panelTitle: { margin: 0, fontFamily: FONT_MONO, fontSize: "11.5px", fontWeight: 500, color: "#344054", textTransform: "uppercase", letterSpacing: "0.04em" },
  panelLink: { fontSize: "12.5px", fontWeight: 600, color: ACCENT, cursor: "pointer" },
  sectionNote: { fontSize: "12.5px", color: "#9CA3AF", margin: "-8px 0 18px" },

  infoGrid: { display: "flex", flexDirection: "column", gap: "10px" },
  infoRow: { display: "flex", justifyContent: "space-between", fontSize: "13.5px", borderBottom: "1px solid #F3F4F6", paddingBottom: "9px" },
  infoLabel: { color: "#667085" },
  infoValue: { color: "#101828", fontWeight: 500, textAlign: "right" },

  row: { display: "flex", gap: "14px" },
  col: { flex: 1 },
  label: { display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px", marginTop: "2px" },
  input: { width: "100%", padding: "12px 14px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #D9DEE6", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "#fff", color: "#101828" },

  button: { padding: "12px 22px", background: ACCENT, border: "none", borderRadius: "8px", color: "#fff", fontSize: "14px", cursor: "pointer", fontWeight: 600 },
  buttonDisabled: { background: "#B7C6E8", cursor: "not-allowed" },

  errorNote: { color: "#B3261E", background: "#FCEEED", border: "1px solid #F5D0CC", padding: "10px 12px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" },
  successNote: { color: "#0F7A3D", background: "#E9F8EF", border: "1px solid #CDEBD9", padding: "10px 12px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" },

  notifRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" },
  notifTitle: { margin: 0, fontSize: "13.5px", fontWeight: 600, color: "#101828" },
  notifSub: { margin: "4px 0 0", fontSize: "12.5px", color: "#667085", lineHeight: 1.5, maxWidth: "440px" },
  alwaysOnPill: { fontFamily: FONT_MONO, fontSize: "10px", fontWeight: 600, color: "#0F7A3D", background: "#E9F8EF", padding: "5px 11px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.04em", flexShrink: 0 },
};