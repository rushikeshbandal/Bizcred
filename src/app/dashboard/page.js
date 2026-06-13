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
};