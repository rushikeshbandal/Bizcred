"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerWallet() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      const [profileRes, walletRes, txRes] = await Promise.all([
        fetch("/api/customer/me", { headers: { Authorization: "Bearer " + token } }),
        fetch("/api/customer/wallet", { headers: { Authorization: "Bearer " + token } }),
        fetch("/api/customer/transactions", { headers: { Authorization: "Bearer " + token } }),
      ]);

      const profileData = await profileRes.json();
      const walletData = await walletRes.json();
      const txData = await txRes.json();

      if (!profileData.success) {
        localStorage.removeItem("customerToken");
        router.push("/customer/login");
        return;
      }

      setUser(profileData.user);
      setWallet(walletData.success ? walletData.wallet : { balance: 0, currency: "INR" });

      if (txData.success) {
        setTransactions(txData.transactions.slice(0, 6));
        setSummary(txData.summary);
      }
    } catch (err) {
      setError("Unable to load your wallet. Please try again.");
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

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function walletIdMask(id) {
    if (!id) return "•••• ••••";
    const str = String(id);
    return "•••• " + str.slice(-4).toUpperCase();
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.spinner} />
        <p style={{ color: "#667085", fontSize: "14px", marginTop: "16px", fontFamily: FONT_BODY }}>
          Loading your wallet…
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

  const menuItems = [
    { label: "Dashboard", icon: <IconHome />, path: "/customer/dashboard" },
    { label: "My Profile", icon: <IconUser />, path: "/customer/profile" },
    { label: "My KYC", icon: <IconShield />, path: "/customer/kyc" },
    { label: "Wallet", icon: <IconWallet />, path: "/customer/wallet", active: true },
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
          <div>
            <h1 style={styles.pageTitle}>Wallet</h1>
            <p style={styles.pageSub}>Your balance and account funding details</p>
          </div>
        </div>

        {/* BALANCE CARD */}
        <div style={styles.balanceCard}>
          <div style={styles.balancePattern} />
          <div style={styles.balanceTop}>
            <span style={styles.balanceLabelChip}>AVAILABLE BALANCE</span>
            <span style={styles.balanceWalletIcon}><IconWallet /></span>
          </div>
          <h1 style={styles.balanceValue}>
            ₹{(wallet?.balance || 0).toLocaleString("en-IN")}
          </h1>
          <div style={styles.balanceDivider} />
          <div style={styles.balanceMetaRow}>
            <div style={styles.balanceMetaItem}>
              <span style={styles.balanceMetaLabel}>Wallet ID</span>
              <span style={styles.balanceMetaValueMono}>{walletIdMask(wallet?._id || user.id)}</span>
            </div>
            <div style={styles.balanceMetaItem}>
              <span style={styles.balanceMetaLabel}>Status</span>
              <span style={styles.balanceMetaValue}>
                <span
                  style={{
                    ...styles.cardStatusDot,
                    background: wallet?.status === "active" ? "#3DDC84" : "#F3A6A0",
                  }}
                />
                {wallet?.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
            <div style={styles.balanceMetaItem}>
              <span style={styles.balanceMetaLabel}>Currency</span>
              <span style={styles.balanceMetaValue}>{wallet?.currency || "INR"}</span>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total credited</p>
            <h2 style={{ ...styles.statValue, color: "#0F7A3D" }}>
              +₹{summary.totalCredit.toLocaleString("en-IN")}
            </h2>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total debited</p>
            <h2 style={{ ...styles.statValue, color: "#B3261E" }}>
              −₹{summary.totalDebit.toLocaleString("en-IN")}
            </h2>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total transactions</p>
            <h2 style={styles.statValue}>{summary.count}</h2>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div style={styles.panelCard}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Recent activity</h3>
            <span style={styles.panelLink} onClick={() => router.push("/customer/transactions")}>
              View all
            </span>
          </div>

          {transactions.length === 0 ? (
            <p style={styles.emptyNote}>No transactions yet.</p>
          ) : (
            <div style={styles.txList}>
              {transactions.map((t) => (
                <div key={t._id} style={styles.txRow}>
                  <div style={styles.txLeft}>
                    <span
                      style={{
                        ...styles.txDot,
                        background: t.type === "credit" ? "#E9F8EF" : "#FCEEED",
                        color: t.type === "credit" ? "#0F7A3D" : "#B3261E",
                      }}
                    >
                      {t.type === "credit" ? "↓" : "↑"}
                    </span>
                    <div>
                      <p style={styles.txType}>
                        {t.type === "credit" ? "Wallet credit" : "Wallet debit"}
                      </p>
                      <p style={styles.txDate}>{formatDate(t.createdAt)}</p>
                    </div>
                  </div>
                  <span
                    style={{
                      ...styles.txAmount,
                      color: t.type === "credit" ? "#0F7A3D" : "#B3261E",
                    }}
                  >
                    {t.type === "credit" ? "+" : "−"}₹{(t.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

  main: { flex: 1, minWidth: 0, padding: "40px 44px", maxWidth: "1140px" },
  top: { marginBottom: "26px" },
  pageTitle: { margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "26px", fontWeight: 600, color: "#101828" },
  pageSub: { margin: "6px 0 0", color: "#667085", fontSize: "13.5px" },

  balanceCard: {
    position: "relative", overflow: "hidden", padding: "28px", borderRadius: "16px",
    background: "linear-gradient(155deg, #10192B 0%, #24365F 100%)",
    border: "1px solid rgba(255,255,255,0.06)", marginBottom: "20px",
  },
  balancePattern: { position: "absolute", top: "-50px", right: "-50px", width: "180px", height: "180px", borderRadius: "50%", background: "radial-gradient(circle, rgba(88,130,224,0.35) 0%, rgba(88,130,224,0) 70%)", pointerEvents: "none" },
  balanceTop: { display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" },
  balanceLabelChip: { fontFamily: FONT_MONO, fontSize: "10px", fontWeight: 600, color: "#E7EEFF", background: "rgba(127,161,240,0.22)", padding: "4px 9px", borderRadius: "6px", letterSpacing: "0.05em" },
  balanceWalletIcon: { color: "#7FA1F0", display: "flex" },
  balanceValue: { margin: "18px 0 0", fontSize: "38px", fontWeight: 700, color: "#FFFFFF", position: "relative", letterSpacing: "-0.01em" },
  balanceDivider: { height: "1px", background: "rgba(255,255,255,0.1)", margin: "22px 0 18px" },
  balanceMetaRow: { display: "flex", gap: "32px", flexWrap: "wrap", position: "relative" },
  balanceMetaItem: { display: "flex", flexDirection: "column", gap: "4px" },
  balanceMetaLabel: { fontFamily: FONT_MONO, fontSize: "9.5px", color: "#7C8AA8", textTransform: "uppercase", letterSpacing: "0.05em" },
  balanceMetaValue: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", color: "#E7EAF0", fontWeight: 500 },
  balanceMetaValueMono: { fontFamily: FONT_MONO, fontSize: "13.5px", color: "#E7EAF0" },
  cardStatusDot: { width: "6px", height: "6px", borderRadius: "50%" },

  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "20px" },
  statCard: { background: "#fff", border: "1px solid #E4E7EC", borderRadius: "12px", padding: "18px" },
  statLabel: { margin: 0, fontFamily: FONT_MONO, fontSize: "10.5px", color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" },
  statValue: { margin: "10px 0 0", fontSize: "20px", fontWeight: 700, color: "#101828" },

  panelCard: { background: "#fff", border: "1px solid #E4E7EC", borderRadius: "12px", padding: "20px" },
  panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" },
  panelTitle: { margin: 0, fontFamily: FONT_MONO, fontSize: "11.5px", fontWeight: 500, color: "#344054", textTransform: "uppercase", letterSpacing: "0.04em" },
  panelLink: { fontSize: "12.5px", fontWeight: 600, color: ACCENT, cursor: "pointer" },
  emptyNote: { fontSize: "13.5px", color: "#9CA3AF", textAlign: "center", padding: "20px 0" },

  txList: { display: "flex", flexDirection: "column" },
  txRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F3F4F6" },
  txLeft: { display: "flex", alignItems: "center", gap: "12px" },
  txDot: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px" },
  txType: { margin: 0, fontSize: "13.5px", fontWeight: 600, color: "#101828" },
  txDate: { margin: "2px 0 0", fontSize: "12px", color: "#9CA3AF" },
  txAmount: { fontFamily: FONT_MONO, fontSize: "14px", fontWeight: 600 },
};