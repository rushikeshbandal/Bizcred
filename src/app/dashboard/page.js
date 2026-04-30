"use client";

import { useEffect, useState } from "react";
import Chart from "chart.js/auto";
import { Doughnut, Bar } from "react-chartjs-2";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);

  const [userGrowth, setUserGrowth] = useState(0);
  const [balanceGrowth, setBalanceGrowth] = useState(0);

  // 🆕 STATUS STATS
  const [stats, setStats] = useState({
    newUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    suspendedUsers: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:3000/api/users/list", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();
      const usersData = data.users || [];

      setUsers(usersData);

      let total = 0;
      usersData.forEach((u) => {
        total += u.wallet?.balance || 0;
      });

      setTotalBalance(total);

      // 📊 MONTHLY + STATUS LOGIC
      const now = new Date();
      const currentMonth = now.getMonth();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

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

        // Monthly
        if (created.getMonth() === currentMonth) {
          currentUsers++;
          currentBalance += u.wallet?.balance || 0;
          newUsers++;
        } else if (created.getMonth() === lastMonth) {
          lastUsers++;
          lastBalance += u.wallet?.balance || 0;
        }

        // Status
        if (u.status === "active") activeUsers++;
        else if (u.status === "blocked") blockedUsers++;
        else if (u.status === "suspended") suspendedUsers++;
      });

      const userGrowthPercent =
        lastUsers === 0 ? 100 : ((currentUsers - lastUsers) / lastUsers) * 100;

      const balanceGrowthPercent =
        lastBalance === 0
          ? 100
          : ((currentBalance - lastBalance) / lastBalance) * 100;

      setUserGrowth(userGrowthPercent.toFixed(1));
      setBalanceGrowth(balanceGrowthPercent.toFixed(1));

      setStats({
        newUsers,
        activeUsers,
        blockedUsers,
        suspendedUsers,
      });

    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

  const doughnutData = {
    labels: ["Users", "Balance"],
    datasets: [
      {
        data: [users.length, totalBalance],
        backgroundColor: ["#667eea", "#00c9a7"],
      },
    ],
  };

  const barData = {
    labels: users.map((u) => u.name),
    datasets: [
      {
        label: "Balance",
        data: users.map((u) => u.wallet?.balance || 0),
        backgroundColor: "#667eea",
      },
    ],
  };

  return (
    <div style={container}>
      
      {/* SIDEBAR */}
      <div style={sidebar}>
        <h2>💳 BizCred</h2>

        <p style={link} onClick={() => location.href="/dashboard"}>📊 Dashboard</p>
        <p style={link} onClick={() => location.href="/users"}>👥 Users</p>
        <p style={link} onClick={() => location.href="/add-user"}>➕ Add User</p>

        {/* 🆕 EXTRA MENU */}
        <hr style={{ opacity: 0.3 }} />
        <p style={link}>📜 Transactions</p>
        <p style={link}>🧾 KYC</p>
        <p style={link}>🔒 Wallet Control</p>
        <p style={link}>⚙️ Settings</p>
      </div>

      {/* MAIN */}
      <div style={main}>
        <h1 style={heading}>📊 Admin Dashboard</h1>

        {/* CARDS */}
        <div style={cardGrid}>
          <div style={{ ...card, background: gradient1 }}>
            <h4>Total Users</h4>
            <h2>{users.length}</h2>
          </div>

          <div style={{ ...card, background: gradient2 }}>
            <h4>Total Balance</h4>
            <h2>₹{totalBalance}</h2>
          </div>

          <div style={{ ...card, background: gradient3 }}>
            <h4>Transactions</h4>
            <h2>{users.length * 5}</h2>
          </div>

          <div style={{ ...card, background: gradient4 }}>
            <h4>Growth</h4>
            <h2>+{userGrowth}%</h2>
          </div>
        </div>

        {/* 📈 MONTHLY GROWTH */}
        <div style={growthBox}>
          <h2>📈 Monthly Growth</h2>

          <div style={growthGrid}>
            <div style={growthCard}>
              <h4>👤 User Growth</h4>
              <h2 style={{ color: "green" }}>+{userGrowth}%</h2>
            </div>

            <div style={growthCard}>
              <h4>💰 Balance Growth</h4>
              <h2 style={{ color: "green" }}>+{balanceGrowth}%</h2>
            </div>

            {/* 🆕 NEW */}
            <div style={growthCard}>
              <h4>🆕 New Users</h4>
              <h2>{stats.newUsers}</h2>
            </div>

            <div style={growthCard}>
              <h4>✅ Active Users</h4>
              <h2>{stats.activeUsers}</h2>
            </div>

            <div style={growthCard}>
              <h4>⛔ Blocked Users</h4>
              <h2>{stats.blockedUsers}</h2>
            </div>

            <div style={growthCard}>
              <h4>⚠️ Suspended Users</h4>
              <h2>{stats.suspendedUsers}</h2>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div style={chartGrid}>
          <div style={chartCard}>
            <h3>User vs Balance</h3>
            <Doughnut data={doughnutData} />
          </div>

          <div style={chartCard}>
            <h3>User Balances</h3>
            <Bar data={barData} />
          </div>
        </div>
      </div>
    </div>
  );
}

//
// 🎨 STYLES
//

const container = {
  display: "flex",
  minHeight: "100vh",
  background: "#f1f3f9",
};

const sidebar = {
  width: "220px",
  background: "linear-gradient(180deg,#667eea,#764ba2)",
  color: "#fff",
  padding: "20px",
};

const link = {
  cursor: "pointer",
  padding: "10px",
  borderRadius: "8px",
  marginTop: "10px",
};

const main = {
  flex: 1,
  padding: "25px",
};

const heading = {
  marginBottom: "20px",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginBottom: "20px",
};

const card = {
  color: "#fff",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
};

const gradient1 = "linear-gradient(135deg,#667eea,#764ba2)";
const gradient2 = "linear-gradient(135deg,#00c9a7,#92fe9d)";
const gradient3 = "linear-gradient(135deg,#f7971e,#ffd200)";
const gradient4 = "linear-gradient(135deg,#ff6a88,#ff99ac)";

const growthBox = {
  background: "#fff",
  padding: "20px",
  borderRadius: "15px",
  marginBottom: "20px",
};

const growthGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
};

const growthCard = {
  background: "#f0fff4",
  padding: "15px",
  borderRadius: "10px",
  textAlign: "center",
};

const chartGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
};

const chartCard = {
  background: "#fff",
  padding: "20px",
  borderRadius: "15px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
};