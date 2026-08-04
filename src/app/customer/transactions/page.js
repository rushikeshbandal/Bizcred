"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerTransactions() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalCredit: 0, totalDebit: 0, count: 0 });
  const [filter, setFilter] = useState("all"); // all | credit | debit
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
      const [profileRes, txRes] = await Promise.all([
        fetch("/api/customer/me", { headers: { Authorization: "Bearer " + token } }),
        fetch("/api/customer/transactions", { headers: { Authorization: "Bearer " + token } }),
      ]);

      const profileData = await profileRes.json();
      const txData = await txRes.json();

      if (!profileData.success) {
        localStorage.removeItem("customerToken");
        router.push("/customer/login");
        return;
      }

      setUser(profileData.user);

      if (txData.success) {
        setTransactions(txData.transactions);
        setSummary(txData.summary);
      } else {
        setError(txData.message || "Unable to load transactions.");
      }
    } catch (err) {
      setError("Unable to load your transactions. Please try again.");
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

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={styles.spinner} />
        <p style={{ color: "#667085", fontSize: "14px", marginTop: "16px", fontFamily: FONT_BODY }}>
          Loading your transactions…
        </p>
      </div>
    );
  }

  if (!user) return null;

  const filtered =
    filter === "all" ? transactions : transactions.filter((t) => t.type === filter);

  const menuItems = [
    { label: "Dashboard", icon: <IconHome />, path: "/customer/dashboard" },
    { label: "My Profile", icon: <IconUser />, path: "/customer/profile" },
    { label: "My KYC", icon: <IconShield />, path: "/customer/kyc" },
    { label: "Wallet", icon: <IconWallet />, path: "/customer/wallet" },
    { label: "Transactions", icon: <IconList />, path: "/customer/transactions", active: true },
    { label: "Support", icon: <IconSupport />, path: "/customer/support" },
    { label: "Settings", icon: <IconSettings />, path: "/customer/settings" },
  ];

  const filters = [
    { key: "all", label: "All" },
    { key: "credit", label: "Credit" },
    { key: "debit", label: "Debit" },
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
            <h1 style={styles.pageTitle}>Transactions</h1>
            <p style={styles.pageSub}>Full history of activity on your wallet</p>
          </div>
        </div>

        {/* SUMMARY STRIP */}
        <div style={styles.summaryStrip}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total credited</span>
            <span style={{ ...styles.summaryValue, color: "#0F7A3D" }}>
              +₹{summary.totalCredit.toLocaleString("en-IN")}
            </span>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total debited</span>
            <span style={{ ...styles.summaryValue, color: "#B3261E" }}>
              −₹{summary.totalDebit.toLocaleString("en-IN")}
            </span>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Net</span>
            <span style={styles.summaryValue}>
              ₹{(summary.totalCredit - summary.totalDebit).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* FILTER + TABLE */}
        <div style={styles.panelCard}>
          <div style={styles.filterRow}>
            {filters.map((f) => (
              <button
                key={f.key}
                style={filter === f.key ? styles.filterBtnActive : styles.filterBtn}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error && <p style={styles.errorNote}>{error}</p>}

          {filtered.length === 0 ? (
            <p style={styles.emptyNote}>No transactions to show.</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Time</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t._id}>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.typeBadge,
                            color: t.type === "credit" ? "#0F7A3D" : "#B3261E",
                            background: t.type === "credit" ? "#E9F8EF" : "#FCEEED",
                          }}
                        >
                          {t.type === "credit" ? "Credit" : "Debit"}
                        </span>
                      </td>
                      <td style={styles.td}>{formatDate(t.createdAt)}</td>
                      <td style={styles.tdMuted}>{formatTime(t.createdAt)}</td>
                      <td
                        style={{
                          ...styles.tdAmount,
                          color: t.type === "credit" ? "#0F7A3D" : "#B3261E",
                        }}
                      >
                        {t.type === "credit" ? "+" : "−"}₹{(t.amount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  top: { marginBottom: "22px" },
  pageTitle: { margin: 0, fontFamily: "'Source Serif 4', Georgia, serif", fontSize: "26px", fontWeight: 600, color: "#101828" },
  pageSub: { margin: "6px 0 0", color: "#667085", fontSize: "13.5px" },

  summaryStrip: { display: "flex", alignItems: "center", background: "#fff", border: "1px solid #E4E7EC", borderRadius: "12px", padding: "18px 24px", marginBottom: "20px", flexWrap: "wrap", gap: "18px" },
  summaryItem: { display: "flex", flexDirection: "column", gap: "4px" },
  summaryLabel: { fontFamily: FONT_MONO, fontSize: "10px", color: "#667085", textTransform: "uppercase", letterSpacing: "0.05em" },
  summaryValue: { fontSize: "18px", fontWeight: 700, color: "#101828" },
  summaryDivider: { width: "1px", height: "32px", background: "#E4E7EC" },

  panelCard: { background: "#fff", border: "1px solid #E4E7EC", borderRadius: "12px", padding: "20px" },
  filterRow: { display: "flex", gap: "8px", marginBottom: "16px" },
  filterBtn: { padding: "8px 16px", borderRadius: "20px", border: "1px solid #E4E7EC", background: "#fff", color: "#667085", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  filterBtnActive: { padding: "8px 16px", borderRadius: "20px", border: "1px solid " + ACCENT, background: ACCENT, color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" },

  emptyNote: { fontSize: "13.5px", color: "#9CA3AF", textAlign: "center", padding: "30px 0" },
  errorNote: { fontSize: "13px", color: "#B3261E", background: "#FCEEED", border: "1px solid #F5D0CC", padding: "10px 12px", borderRadius: "8px", marginBottom: "14px" },

  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontFamily: FONT_MONO, fontSize: "10.5px", color: "#667085", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid #E4E7EC" },
  td: { padding: "14px 12px", fontSize: "13.5px", color: "#101828", borderBottom: "1px solid #F3F4F6" },
  tdMuted: { padding: "14px 12px", fontSize: "13px", color: "#9CA3AF", borderBottom: "1px solid #F3F4F6" },
  tdAmount: { padding: "14px 12px", fontFamily: FONT_MONO, fontSize: "13.5px", fontWeight: 600, textAlign: "right", borderBottom: "1px solid #F3F4F6" },
  typeBadge: { fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px" },
};