"use client";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showTx, setShowTx] = useState(false);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await fetch("http://localhost:3000/api/users/list", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    const data = await res.json();
    setUsers(data.users || []);
  };

  const handleStatusChange = async (userId, status) => {
    const res = await fetch("http://localhost:3000/api/users/status", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ userId, status }),
    });

    const data = await res.json();
    alert(data.message);
    loadUsers();
  };

  const handleCredit = async (userId) => {
    const amount = prompt("Enter amount:");
    if (!amount) return;

    setLoading(true);

    const res = await fetch("http://localhost:3000/api/wallet/credit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ userId, amount: Number(amount) }),
    });

    const data = await res.json();
    alert(data.message);

    setLoading(false);
    loadUsers();
  };

  const handleDebit = async (userId) => {
    const amount = prompt("Enter amount:");
    if (!amount) return;

    setLoading(true);

    const res = await fetch("http://localhost:3000/api/wallet/debit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ userId, amount: Number(amount) }),
    });

    const data = await res.json();
    alert(data.message);

    setLoading(false);
    loadUsers();
  };

  // ✅ TRANSACTION HISTORY (RESTORED)
  const handleTransactionHistory = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/transactions/user?userId=${userId}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        alert(data.message || "Error fetching transactions");
        return;
      }

      setTransactions(data.transactions || []);
      setShowTx(true);
    } catch {
      alert("Server error while fetching transactions");
    }
  };

  return (
    <div style={container}>
      <h1 style={title}>👤 User Management</h1>

      <div style={grid}>
        {users.map((u) => (
          <div key={u._id} style={card}>

            {/* HEADER */}
            <div style={header}>
              <div style={avatar}>
                {u.name?.charAt(0)?.toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{u.name}</h3>
                <p style={email}>{u.email}</p>
              </div>

              <span style={statusBadge(u.status)}>
                {u.status || "active"}
              </span>
            </div>

            {/* BALANCE */}
            <div style={balanceBox}>
              <p>Wallet Balance</p>
              <h2>₹{u.wallet?.balance || 0}</h2>
            </div>

            {/* STATUS */}
            <div style={statusRow}>
              <button onClick={() => handleStatusChange(u._id, "active")} style={activeBtn}>Active</button>
              <button onClick={() => handleStatusChange(u._id, "blocked")} style={blockBtn}>Block</button>
              <button onClick={() => handleStatusChange(u._id, "suspended")} style={suspendBtn}>Suspend</button>
            </div>

            {/* WALLET */}
            <div style={btnRow}>
              <button onClick={() => handleCredit(u._id)} style={creditBtn}>➕ Credit</button>
              <button onClick={() => handleDebit(u._id)} style={debitBtn}>➖ Debit</button>
            </div>

            {/* ✅ TRANSACTION BUTTON BACK */}
            <button style={txBtn} onClick={() => handleTransactionHistory(u._id)}>
              📜 View Transactions
            </button>

          </div>
        ))}
      </div>

      {/* ✅ TRANSACTION MODAL */}
      {showTx && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2>Transaction History</h2>

            {transactions.length === 0 ? (
              <p>No transactions found</p>
            ) : (
              transactions.map((t, i) => (
                <div key={i} style={txItem}>
                  <div style={txRow}>
                    <span style={{
                      color: t.type === "credit" ? "green" : "red",
                      fontWeight: "bold"
                    }}>
                      {t.type.toUpperCase()}
                    </span>

                    <span>₹{t.amount}</span>
                  </div>

                  <p style={date}>
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}

            <button onClick={() => setShowTx(false)} style={closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

//
// 🎨 UI STYLES
//

const container = {
  padding: "30px",
  background: "linear-gradient(135deg,#eef2ff,#f9fafc)",
  minHeight: "100vh",
};

const title = {
  textAlign: "center",
  marginBottom: "30px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "25px",
};

const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};

const header = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const avatar = {
  width: 45,
  height: 45,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#667eea,#764ba2)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const email = { fontSize: "12px", color: "gray" };

const statusBadge = (status) => ({
  padding: "5px 10px",
  borderRadius: "20px",
  background:
    status === "blocked" ? "#ffe5e5" :
    status === "suspended" ? "#fff4e5" : "#e6f7ee",
  color:
    status === "blocked" ? "red" :
    status === "suspended" ? "orange" : "green",
});

const balanceBox = {
  marginTop: "15px",
  padding: "15px",
  background: "#f1f3ff",
  borderRadius: "10px",
  textAlign: "center",
};

const statusRow = {
  display: "flex",
  gap: "6px",
  marginTop: "10px",
};

const activeBtn = { flex: 1, background: "green", color: "#fff" };
const blockBtn = { flex: 1, background: "red", color: "#fff" };
const suspendBtn = { flex: 1, background: "orange", color: "#fff" };

const btnRow = {
  display: "flex",
  gap: "10px",
  marginTop: "10px",
};

const creditBtn = { flex: 1, background: "#28a745", color: "#fff" };
const debitBtn = { flex: 1, background: "#dc3545", color: "#fff" };

const txBtn = {
  marginTop: "10px",
  width: "100%",
  background: "#667eea",
  color: "#fff",
  padding: "10px",
  borderRadius: "8px",
};

const modalOverlay = {
  position: "fixed",
  top: 0, left: 0,
  width: "100%", height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modal = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "350px"
};

const txItem = { padding: "10px", borderBottom: "1px solid #eee" };
const txRow = { display: "flex", justifyContent: "space-between" };
const date = { fontSize: "12px", color: "gray" };
const closeBtn = { marginTop: "10px", width: "100%" };