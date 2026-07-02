"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";

import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);

  const [userGrowth, setUserGrowth] = useState(0);
  const [balanceGrowth, setBalanceGrowth] = useState(0);

  const [monthlyUsers, setMonthlyUsers] = useState(
    new Array(12).fill(0)
  );

  const [stats, setStats] = useState({
    newUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    suspendedUsers: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      // USERS API
      const res = await fetch(
        "http://localhost:3000/api/users/list",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();

      const usersData = data.users || [];

      setUsers(usersData);

      let total = 0;
      let monthly = new Array(12).fill(0);

      const now = new Date();
      const currentMonth = now.getMonth();
      const lastMonth =
        currentMonth === 0 ? 11 : currentMonth - 1;

      let currentUsers = 0;
      let lastUsers = 0;

      let currentBalance = 0;
      let lastBalance = 0;

      let newUsers = 0;
      let activeUsers = 0;
      let blockedUsers = 0;
      let suspendedUsers = 0;

      usersData.forEach((u) => {
        const created = new Date(u.createdAt);

        total += u.wallet?.balance || 0;

        monthly[created.getMonth()]++;

        if (created.getMonth() === currentMonth) {
          currentUsers++;
          currentBalance += u.wallet?.balance || 0;
          newUsers++;
        } else if (
          created.getMonth() === lastMonth
        ) {
          lastUsers++;
          lastBalance += u.wallet?.balance || 0;
        }

        if (u.status === "active") activeUsers++;
        else if (u.status === "blocked")
          blockedUsers++;
        else if (u.status === "suspended")
          suspendedUsers++;
      });

      setMonthlyUsers(monthly);

      setTotalBalance(total);

      const userGrowthPercent =
        lastUsers === 0
          ? 100
          : ((currentUsers - lastUsers) /
              lastUsers) *
            100;

      const balanceGrowthPercent =
        lastBalance === 0
          ? 100
          : ((currentBalance - lastBalance) /
              lastBalance) *
            100;

      setUserGrowth(
        userGrowthPercent.toFixed(1)
      );

      setBalanceGrowth(
        balanceGrowthPercent.toFixed(1)
      );

      setStats({
        newUsers,
        activeUsers,
        blockedUsers,
        suspendedUsers,
      });

      // RECENT USERS
      const sortedUsers = [...usersData]
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        )
        .slice(0, 5);

      setRecentUsers(sortedUsers);

      // TRANSACTIONS
      const txRes = await fetch(
        "http://localhost:3000/api/transactions/all",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const txData = await txRes.json();

      setTransactionsCount(
        txData.transactions?.length || 0
      );
    } catch (error) {
      console.log(error);
    }
  };

  // CHARTS

  const doughnutData = {
    labels: ["Users", "Balance"],
    datasets: [
      {
        data: [users.length, totalBalance],
        backgroundColor: ["#667eea", "#00c9a7"],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],

    datasets: [
      {
        label: "Users Joined",
        data: monthlyUsers,
        backgroundColor: "#667eea",
        borderRadius: 8,
      },
    ],
  };

  const lineData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],

    datasets: [
      {
        label: "Platform Growth",
        data: monthlyUsers,
        borderColor: "#00c9a7",
        backgroundColor: "#00c9a7",
        tension: 0.4,
      },
    ],
  };

  return (
    <div style={container}>
      {/* SIDEBAR */}
      <div style={sidebar}>
        <div>
          <h1 style={logo}>💳 BizCred</h1>

          <SidebarItem
            text="📊 Dashboard"
            path="/dashboard"
          />

          <SidebarItem
            text="👥 Users"
            path="/users"
          />

          <SidebarItem
            text="📜 Transactions"
            path="/transactions"
          />

          <SidebarItem
            text="💰 Wallet"
            path="/wallet"
          />

          <SidebarItem
            text="🧾 KYC"
            path="/kyc"
          />

          <SidebarItem
            text="➕ Add User"
            path="/add-user"
          />

          <SidebarItem
            text="⚙️ Settings"
            path="/settings"
          />

          <SidebarItem
            text="🔐 Security"
            path="/security"
          />

          <SidebarItem
            text="📩 Support"
            path="/support"
          />
        </div>

        <div style={bottomBox}>
          <h4>Admin Panel</h4>

          <p
            style={{
              fontSize: "13px",
              opacity: 0.8,
            }}
          >
            Manage users, wallet, KYC and analytics
          </p>
        </div>
      </div>

      {/* MAIN */}
      <div style={main}>
        {/* TOPBAR */}
        <div style={topbar}>
          <div>
            <h1 style={heading}>
              📊 Admin Dashboard
            </h1>

            <p style={subHeading}>
              Welcome back, Admin 👋
            </p>
          </div>

          <div style={topRight}>
            <input
              placeholder="Search..."
              style={search}
            />

            <div style={adminProfile}>
              <div style={avatar}>R</div>

              <div>
                <h4 style={{ margin: 0 }}>
                  Rushikesh
                </h4>

                <p style={role}>
                  Super Admin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div style={cardGrid}>
          <div
            style={{
              ...card,
              background: gradient1,
            }}
          >
            <h4>Total Users</h4>
            <h1>{users.length}</h1>
            <p>All registered users</p>
          </div>

          <div
            style={{
              ...card,
              background: gradient2,
            }}
          >
            <h4>Total Balance</h4>
            <h1>₹{totalBalance}</h1>
            <p>Wallet balance available</p>
          </div>

          <div
            style={{
              ...card,
              background: gradient3,
            }}
          >
            <h4>Transactions</h4>
            <h1>{transactionsCount}</h1>
            <p>Total processed transactions</p>
          </div>

          <div
            style={{
              ...card,
              background: gradient4,
            }}
          >
            <h4>User Growth</h4>
            <h1>+{userGrowth}%</h1>
            <p>Compared to last month</p>
          </div>
        </div>

        {/* QUICK STATS */}
        <div style={quickStats}>
          <div style={quickCard}>
            <h3>🆕 New Users</h3>
            <h1>{stats.newUsers}</h1>
          </div>

          <div style={quickCard}>
            <h3>✅ Active Users</h3>
            <h1>{stats.activeUsers}</h1>
          </div>

          <div style={quickCard}>
            <h3>⛔ Blocked Users</h3>
            <h1>{stats.blockedUsers}</h1>
          </div>

          <div style={quickCard}>
            <h3>⚠️ Suspended</h3>
            <h1>{stats.suspendedUsers}</h1>
          </div>

          <div style={quickCard}>
            <h3>💰 Balance Growth</h3>
            <h1>+{balanceGrowth}%</h1>
          </div>
        </div>

        {/* CHARTS */}
        <div style={chartGrid}>
          <div style={chartCard}>
            <h2>User vs Balance</h2>

            <div style={{ height: "300px" }}>
              <Doughnut data={doughnutData} />
            </div>
          </div>

          <div style={chartCard}>
            <h2>Monthly User Growth</h2>

            <Bar data={barData} />
          </div>
        </div>

        {/* LINE CHART */}
        <div style={chartCard}>
          <h2>📈 Platform Analytics</h2>

          <Line data={lineData} />
        </div>

        {/* RECENT USERS */}
        <div style={tableCard}>
          <div style={tableHeader}>
            <h2>👥 Recent Users</h2>

            <button
        style={viewBtn}
        onClick={() => (location.href = "/users")}
             >
        View All
        </button>
          </div>

          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Balance</th>
                <th style={th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentUsers.map((u, i) => (
                <tr key={i}>
                  <td style={td}>
                    {u.name || "No Name"}
                  </td>

                  <td style={td}>
                    {u.email}
                  </td>

                  <td style={td}>
                    ₹
                    {u.wallet?.balance || 0}
                  </td>

                  <td style={td}>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        background:
                          u.status === "active"
                            ? "#dcfce7"
                            : u.status ===
                              "blocked"
                            ? "#fee2e2"
                            : "#fef3c7",
                      }}
                    >
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

//
// SIDEBAR ITEM COMPONENT
//

function SidebarItem({ text, path }) {
  return (
    <p
      style={menuItem}
      onClick={() =>
        (location.href = path)
      }
      onMouseOver={(e) =>
        (e.currentTarget.style.background =
          "rgba(255,255,255,0.15)")
      }
      onMouseOut={(e) =>
        (e.currentTarget.style.background =
          "rgba(255,255,255,0.05)")
      }
    >
      {text}
    </p>
  );
}

//
// STYLES
//

const container = {
  display: "flex",
  minHeight: "100vh",
  background: "#f4f7fe",
  fontFamily: "Arial",
  paddingTop: "50px",
};

const sidebar = {
  width: "250px",
  background:
    "linear-gradient(180deg,#111827,#1f2937)",
  color: "#fff",
  padding: "25px 20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const logo = {
  marginBottom: "40px",
  color: "#fff",
};

const menuItem = {
  padding: "14px",
  borderRadius: "12px",
  cursor: "pointer",
  marginBottom: "10px",
  transition: "0.3s",
  background: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontWeight: "500",
};

const bottomBox = {
  background: "rgba(255,255,255,0.08)",
  padding: "15px",
  borderRadius: "15px",
};

const main = {
  flex: 1,
  padding: "25px",
};

const topbar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
  flexWrap: "wrap",
  gap: "20px",
};

const heading = {
  margin: 0,
};

const subHeading = {
  color: "#666",
};

const topRight = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
};

const search = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  width: "220px",
};

const adminProfile = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#fff",
  padding: "10px 15px",
  borderRadius: "12px",
};

const avatar = {
  width: "45px",
  height: "45px",
  borderRadius: "50%",
  background: "#667eea",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
};

const role = {
  margin: 0,
  fontSize: "12px",
  color: "#777",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "20px",
  marginBottom: "25px",
};

const card = {
  padding: "25px",
  borderRadius: "20px",
  color: "#fff",
  boxShadow:
    "0 8px 20px rgba(0,0,0,0.1)",
};

const gradient1 =
  "linear-gradient(135deg,#667eea,#764ba2)";

const gradient2 =
  "linear-gradient(135deg,#00c9a7,#92fe9d)";

const gradient3 =
  "linear-gradient(135deg,#f7971e,#ffd200)";

const gradient4 =
  "linear-gradient(135deg,#ff6a88,#ff99ac)";

const quickStats = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: "20px",
  marginBottom: "25px",
};

const quickCard = {
  background: "#fff",
  padding: "20px",
  borderRadius: "18px",
  boxShadow:
    "0 5px 15px rgba(0,0,0,0.05)",
};

const chartGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(350px,1fr))",
  gap: "20px",
  marginBottom: "25px",
};

const chartCard = {
  background: "#fff",
  padding: "25px",
  borderRadius: "20px",
  boxShadow:
    "0 5px 15px rgba(0,0,0,0.05)",
  marginBottom: "25px",
};

const tableCard = {
  background: "#fff",
  padding: "25px",
  borderRadius: "20px",
  boxShadow:
    "0 5px 15px rgba(0,0,0,0.05)",
};

const tableHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const viewBtn = {
  background: "#667eea",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: "10px",
  cursor: "pointer",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "15px",
  borderBottom: "1px solid #eee",
  background: "#f9fafb",
};

const td = {
  padding: "15px",
  borderBottom: "1px solid #eee",
};"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement
);

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [userGrowth, setUserGrowth] = useState(0);
  const [balanceGrowth, setBalanceGrowth] = useState(0);
  const [monthlyUsers, setMonthlyUsers] = useState(new Array(12).fill(0));
  const [stats, setStats] = useState({
    newUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    suspendedUsers: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [supportStats, setSupportStats] = useState({
    total: 0, open: 0, inProgress: 0, resolved: 0, critical: 0,
  });

  useEffect(() => {
    loadDashboard();
    loadSupportStats();
  }, []);

  // ── EXACT ORIGINAL WORKING LOGIC ──────────────────────────────
  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/api/users/list", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      const usersData = data.users || [];
      setUsers(usersData);

      let total = 0;
      let monthly = new Array(12).fill(0);
      const now = new Date();
      const currentMonth = now.getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      let currentUsers = 0, lastUsers = 0, currentBalance = 0, lastBalance = 0;
      let newUsers = 0, activeUsers = 0, blockedUsers = 0, suspendedUsers = 0;

      usersData.forEach((u) => {
        const created = new Date(u.createdAt);
        total += u.wallet?.balance || 0;
        monthly[created.getMonth()]++;

        if (created.getMonth() === currentMonth) {
          currentUsers++;
          currentBalance += u.wallet?.balance || 0;
          newUsers++;
        } else if (created.getMonth() === lastMonth) {
          lastUsers++;
          lastBalance += u.wallet?.balance || 0;
        }

        if (u.status === "active") activeUsers++;
        else if (u.status === "blocked") blockedUsers++;
        else if (u.status === "suspended") suspendedUsers++;
      });

      setMonthlyUsers(monthly);
      setTotalBalance(total);

      const userGrowthPct = lastUsers === 0
        ? 100
        : ((currentUsers - lastUsers) / lastUsers) * 100;
      const balanceGrowthPct = lastBalance === 0
        ? 100
        : ((currentBalance - lastBalance) / lastBalance) * 100;

      setUserGrowth(userGrowthPct.toFixed(1));
      setBalanceGrowth(balanceGrowthPct.toFixed(1));
      setStats({ newUsers, activeUsers, blockedUsers, suspendedUsers });

      const sortedUsers = [...usersData]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentUsers(sortedUsers);

      const txRes = await fetch("http://localhost:3000/api/transactions/all", {
        headers: { Authorization: "Bearer " + token },
      });
      const txData = await txRes.json();
      setTransactionsCount(txData.transactions?.length || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const loadSupportStats = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/support/list");
      const data = await res.json();
      const tickets = data.tickets || [];
      setSupportStats({
        total: tickets.length,
        open: tickets.filter((t) => t.status === "Open").length,
        inProgress: tickets.filter((t) => t.status === "In Progress").length,
        resolved: tickets.filter((t) => t.status === "Resolved").length,
        critical: tickets.filter((t) => t.priority === "Critical").length,
      });
    } catch (err) {
      console.log("Support fetch error:", err);
    }
  };

  // ── CHARTS ────────────────────────────────────────────────────
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const doughnutData = {
    labels: ["Users", "Balance"],
    datasets: [{
      data: [users.length, totalBalance],
      backgroundColor: ["#667eea", "#00c9a7"],
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: MONTHS,
    datasets: [{
      label: "Users Joined",
      data: monthlyUsers,
      backgroundColor: "#667eea",
      borderRadius: 6,
    }],
  };

  const lineData = {
    labels: MONTHS,
    datasets: [{
      label: "Platform Growth",
      data: monthlyUsers,
      borderColor: "#00c9a7",
      backgroundColor: "rgba(0,201,167,0.08)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#00c9a7",
      pointRadius: 4,
    }],
  };

  const barOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f0f0f0" }, beginAtZero: true },
    },
  };

  const lineOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#f0f0f0" }, beginAtZero: true },
    },
  };

  const doughnutOptions = {
    cutout: "72%",
    plugins: {
      legend: { position: "bottom", labels: { padding: 20, font: { size: 13 } } },
    },
  };

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div style={styles.root}>

      {/* ── SIDEBAR ── */}
      <aside style={styles.sidebar}>
        <div>
          {/* Logo */}
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>B</div>
            <span style={styles.logoText}>BizCred</span>
          </div>

          <p style={styles.navSection}>MAIN MENU</p>
          <NavItem icon="📊" label="Dashboard"   path="/dashboard" />
          <NavItem icon="👥" label="Users"        path="/users" />
          <NavItem icon="📜" label="Transactions" path="/transactions" />
          <NavItem icon="💰" label="Wallet"       path="/wallet" />
          <NavItem icon="🧾" label="KYC"          path="/kyc" />
          <NavItem icon="➕" label="Add User"     path="/add-user" />

          <p style={styles.navSection}>SYSTEM</p>
          <NavItem icon="⚙️" label="Settings"    path="/settings" />
          <NavItem icon="🔐" label="Security"     path="/security" />
          <NavItem icon="📩" label="Support"      path="/support"
            badge={supportStats.open > 0 ? supportStats.open : null} />
        </div>

        {/* Sidebar footer */}
        <div style={styles.sidebarFooter}>
          <div style={styles.footerAvatar}>R</div>
          <div>
            <p style={styles.footerName}>Rushikesh</p>
            <p style={styles.footerRole}>Super Admin</p>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={styles.main}>

        {/* Inner topbar — sits below fixed Navbar via paddingTop */}
        <div style={styles.topbar}>
          <div>
            <p style={styles.breadcrumb}>Home / Dashboard</p>
            <h1 style={styles.pageTitle}>Dashboard Overview</h1>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.searchWrap}>
              <span style={{ color: "#94a3b8", fontSize: 15 }}>🔍</span>
              <input placeholder="Search anything..." style={styles.searchInput} />
            </div>
            <div style={styles.notifWrap}>
              🔔
              <span style={styles.notifDot} />
            </div>
            <div style={styles.profileChip}>
              <div style={styles.profileAvatar}>R</div>
              <div>
                <p style={styles.profileName}>Rushikesh</p>
                <p style={styles.profileRole}>Super Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPI CARDS ── */}
        <div style={styles.kpiGrid}>
          <KpiCard icon="👥" label="Total Users"   value={users.length}
            sub="All registered users"        color="#667eea" light="#eef0fd" />
          <KpiCard icon="💳" label="Total Balance"  value={"₹" + totalBalance.toLocaleString()}
            sub="Wallet balance available"    color="#00c9a7" light="#e6faf7" />
          <KpiCard icon="📜" label="Transactions"   value={transactionsCount}
            sub="Total processed"             color="#f7971e" light="#fff8ec" />
          <KpiCard icon="📈" label="User Growth"    value={"+" + userGrowth + "%"}
            sub="Compared to last month"      color="#8b5cf6" light="#f3f0ff" />
        </div>

        {/* ── QUICK STATS ── */}
        <div style={styles.quickGrid}>
          {[
            { icon: "🆕", label: "New Users",      val: stats.newUsers },
            { icon: "✅", label: "Active Users",   val: stats.activeUsers },
            { icon: "⛔", label: "Blocked Users",  val: stats.blockedUsers },
            { icon: "⚠️", label: "Suspended",      val: stats.suspendedUsers },
            { icon: "💰", label: "Balance Growth", val: "+" + balanceGrowth + "%" },
          ].map((item, i) => (
            <div key={i} style={styles.quickCard}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <p style={styles.quickLabel}>{item.label}</p>
              <h2 style={styles.quickVal}>{item.val}</h2>
            </div>
          ))}
        </div>

        {/* ── CHARTS ROW ── */}
        <div style={styles.chartRow}>
          {/* Doughnut */}
          <div style={{ ...styles.chartCard, flex: "1 1 300px" }}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>User vs Balance</h3>
              <span style={styles.chartBadge}>Snapshot</span>
            </div>
            <div style={{ maxWidth: 260, margin: "0 auto" }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <div style={styles.doughnutLegend}>
              <span><span style={{ ...styles.dot, background: "#667eea" }} /> Users <strong>{users.length}</strong></span>
              <span><span style={{ ...styles.dot, background: "#00c9a7" }} /> Balance <strong>₹{totalBalance}</strong></span>
            </div>
          </div>

          {/* Bar */}
          <div style={{ ...styles.chartCard, flex: "2 1 420px" }}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Monthly User Growth</h3>
              <span style={styles.chartBadge}>This Year</span>
            </div>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* ── LINE CHART ── */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>📈 Platform Analytics</h3>
            <span style={styles.chartBadge}>Cumulative Growth</span>
          </div>
          <Line data={lineData} options={lineOptions} />
        </div>

        {/* ── SUPPORT OVERVIEW ── */}
        <div style={styles.sectionWrap}>
          <div style={styles.sectionHead}>
            <div>
              <h3 style={styles.sectionTitle}>📩 Support Overview</h3>
              <p style={styles.sectionSub}>Live ticket status from support queue</p>
            </div>
            <button style={styles.outlineBtn} onClick={() => (location.href = "/support")}>
              Manage Tickets →
            </button>
          </div>

          <div style={styles.supportGrid}>
            {[
              { label: "Total Tickets", val: supportStats.total,      color: "#667eea", bg: "#eef0fd", icon: "🎫" },
              { label: "Open",          val: supportStats.open,        color: "#f7971e", bg: "#fff8ec", icon: "🟠" },
              { label: "In Progress",   val: supportStats.inProgress,  color: "#8b5cf6", bg: "#f3f0ff", icon: "🔵" },
              { label: "Resolved",      val: supportStats.resolved,    color: "#00c9a7", bg: "#e6faf7", icon: "✅" },
              { label: "Critical",      val: supportStats.critical,    color: "#ef4444", bg: "#fef2f2", icon: "🔴" },
            ].map((sc, i) => (
              <div key={i}
                style={{ ...styles.supportCard, borderTop: `3px solid ${sc.color}` }}
                onClick={() => (location.href = "/support")}
              >
                <div style={{ ...styles.supportIconBox, background: sc.bg }}>
                  {sc.icon}
                </div>
                <p style={styles.supportLabel}>{sc.label}</p>
                <h2 style={{ ...styles.supportVal, color: sc.color }}>{sc.val}</h2>
              </div>
            ))}
          </div>
        </div>

        {/* ── RECENT USERS TABLE ── */}
        <div style={styles.tableCard}>
          <div style={styles.tableHead}>
            <div>
              <h3 style={styles.sectionTitle}>👥 Recent Users</h3>
              <p style={styles.sectionSub}>Latest 5 registrations</p>
            </div>
            <button style={styles.primaryBtn} onClick={() => (location.href = "/users")}>
              View All Users
            </button>
          </div>

          <table style={styles.table}>
            <thead>
              <tr>
                {["Name", "Email", "Balance", "Status", "Joined"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u, i) => (
                <tr key={i}>
                  <td style={styles.td}>
                    <div style={styles.userCell}>
                      <div style={styles.userAvatar}>
                        {(u.name || "?").charAt(0).toUpperCase()}
                      </div>
                      {u.name || "No Name"}
                    </div>
                  </td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}><strong>₹{(u.wallet?.balance || 0).toLocaleString()}</strong></td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: u.status === "active"  ? "#dcfce7"
                                : u.status === "blocked" ? "#fee2e2" : "#fef3c7",
                      color:      u.status === "active"  ? "#15803d"
                                : u.status === "blocked" ? "#b91c1c" : "#92400e",
                    }}>
                      {u.status}
                    </span>
                  </td>
                  <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────
function NavItem({ icon, label, path, badge }) {
  const isActive = typeof window !== "undefined" && location.pathname === path;
  return (
    <div
      style={{
        ...styles.navItem,
        background: isActive ? "rgba(102,126,234,0.2)" : "transparent",
        color: isActive ? "#a5b4fc" : "rgba(255,255,255,0.65)",
      }}
      onClick={() => (location.href = path)}
      onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
      onMouseOut={(e)  => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && <span style={styles.navBadge}>{badge}</span>}
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color, light }) {
  return (
    <div style={styles.kpiCard}>
      <div style={{ ...styles.kpiIcon, background: light, color }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div>
        <p style={styles.kpiLabel}>{label}</p>
        <h2 style={{ ...styles.kpiValue, color }}>{value}</h2>
        <p style={styles.kpiSub}>{sub}</p>
      </div>
    </div>
  );
}

// ── All styles ─────────────────────────────────────────────────
const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#f0f2f9",
    fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
  },

  // Sidebar
  sidebar: {
    width: 240,
    minWidth: 240,
    background: "linear-gradient(180deg,#0f172a 0%,#1e293b 100%)",
    color: "#fff",
    padding: "24px 14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 900,          // below Navbar (1000) so navbar stays on top
    overflowY: "auto",
  },
  logoWrap: {
    display: "flex", alignItems: "center", gap: 10,
    marginBottom: 30, paddingLeft: 4,
  },
  logoIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "bold", fontSize: 18, color: "#fff",
  },
  logoText: { fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" },
  navSection: {
    fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
    color: "rgba(255,255,255,0.3)", margin: "18px 0 6px 10px",
  },
  navItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "11px 10px", borderRadius: 10,
    cursor: "pointer", transition: "0.2s",
    marginBottom: 2, fontSize: 14, fontWeight: 500,
  },
  navBadge: {
    background: "#ef4444", color: "#fff",
    fontSize: 10, fontWeight: 700,
    padding: "2px 7px", borderRadius: 20,
  },
  sidebarFooter: {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.06)",
    padding: "12px 12px", borderRadius: 12,
    marginTop: 20,
  },
  footerAvatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "bold", color: "#fff", fontSize: 15,
  },
  footerName: { margin: 0, fontSize: 13, fontWeight: 600, color: "#fff" },
  footerRole: { margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" },

  // Main — left margin = sidebar width, top padding = Navbar height (66px) + gap
  main: {
    flex: 1,
    marginLeft: 240,
    paddingTop: 90,       // 66px navbar + 24px gap so nothing hides under it
    paddingLeft: 28,
    paddingRight: 28,
    paddingBottom: 40,
    minWidth: 0,
  },

  // Inner topbar
  topbar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: 28, flexWrap: "wrap", gap: 16,
  },
  breadcrumb: { fontSize: 12, color: "#94a3b8", margin: "0 0 4px 0" },
  pageTitle:  { fontSize: 24, fontWeight: 700, color: "#1e293b", margin: 0 },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  searchWrap: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 10, padding: "9px 14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  searchInput: {
    border: "none", outline: "none",
    fontSize: 14, color: "#334155",
    width: 200, background: "transparent",
  },
  notifWrap: {
    position: "relative", fontSize: 20, cursor: "pointer",
    background: "#fff", border: "1px solid #e2e8f0",
    borderRadius: 10, padding: "9px 13px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    lineHeight: 1,
  },
  notifDot: {
    position: "absolute", top: 8, right: 8,
    width: 7, height: 7, borderRadius: "50%",
    background: "#ef4444", border: "2px solid #fff",
    display: "block",
  },
  profileChip: {
    display: "flex", alignItems: "center", gap: 10,
    background: "#fff", border: "1px solid #e2e8f0",
    padding: "8px 14px", borderRadius: 12,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  profileAvatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "#fff", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: "bold", fontSize: 14,
  },
  profileName: { margin: 0, fontSize: 13, fontWeight: 600, color: "#1e293b" },
  profileRole: { margin: 0, fontSize: 11, color: "#94a3b8" },

  // KPI cards
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
    gap: 18, marginBottom: 22,
  },
  kpiCard: {
    background: "#fff", borderRadius: 16, padding: "20px 18px",
    display: "flex", alignItems: "center", gap: 16,
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9",
  },
  kpiIcon: {
    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  kpiLabel: {
    margin: "0 0 2px 0", fontSize: 11, color: "#94a3b8",
    fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
  },
  kpiValue: { margin: "0 0 2px 0", fontSize: 26, fontWeight: 800, lineHeight: 1 },
  kpiSub:   { margin: 0, fontSize: 12, color: "#94a3b8" },

  // Quick stats
  quickGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
    gap: 14, marginBottom: 22,
  },
  quickCard: {
    background: "#fff", borderRadius: 14, padding: "16px 14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
  },
  quickLabel: { margin: "6px 0 2px 0", fontSize: 12, color: "#94a3b8", fontWeight: 600 },
  quickVal:   { margin: 0, fontSize: 22, fontWeight: 800, color: "#1e293b" },

  // Charts
  chartRow: { display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 18 },
  chartCard: {
    background: "#fff", borderRadius: 18, padding: "20px 18px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    border: "1px solid #f1f5f9", marginBottom: 18,
  },
  chartHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  chartTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: "#1e293b" },
  chartBadge: {
    fontSize: 11, fontWeight: 600, color: "#667eea",
    background: "#eef0fd", padding: "3px 10px", borderRadius: 20,
  },
  doughnutLegend: {
    display: "flex", justifyContent: "center", gap: 22,
    marginTop: 14, fontSize: 13, color: "#64748b",
  },
  dot: { display: "inline-block", width: 10, height: 10, borderRadius: "50%", marginRight: 5 },

  // Support
  sectionWrap: { marginBottom: 22 },
  sectionHead: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 14,
    flexWrap: "wrap", gap: 10,
  },
  sectionTitle: { margin: "0 0 2px 0", fontSize: 15, fontWeight: 700, color: "#1e293b" },
  sectionSub:   { margin: 0, fontSize: 12, color: "#94a3b8" },
  supportGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(148px,1fr))",
    gap: 14,
  },
  supportCard: {
    background: "#fff", borderRadius: 14, padding: "16px 14px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9",
    cursor: "pointer",
  },
  supportIconBox: {
    width: 36, height: 36, borderRadius: 10, fontSize: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 10,
  },
  supportLabel: { margin: "0 0 4px 0", fontSize: 12, color: "#94a3b8", fontWeight: 600 },
  supportVal:   { margin: 0, fontSize: 24, fontWeight: 800 },

  // Table
  tableCard: {
    background: "#fff", borderRadius: 18, padding: "20px 18px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #f1f5f9",
  },
  tableHead: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 16,
    flexWrap: "wrap", gap: 10,
  },
  table:  { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left", padding: "11px 14px",
    fontSize: 11, fontWeight: 700, color: "#94a3b8",
    textTransform: "uppercase", letterSpacing: 0.5,
    borderBottom: "1px solid #f1f5f9", background: "#fafbfd",
  },
  td: { padding: "13px 14px", borderBottom: "1px solid #f8fafc", fontSize: 14, color: "#334155" },
  userCell:   { display: "flex", alignItems: "center", gap: 10 },
  userAvatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "#fff", display: "flex", alignItems: "center",
    justifyContent: "center", fontWeight: "bold", fontSize: 13, flexShrink: 0,
  },
  badge: { padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },

  // Buttons
  primaryBtn: {
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "#fff", border: "none", padding: "10px 18px",
    borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
    boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
  },
  outlineBtn: {
    background: "transparent", color: "#667eea",
    border: "1.5px solid #667eea", padding: "9px 16px",
    borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
  },
};
