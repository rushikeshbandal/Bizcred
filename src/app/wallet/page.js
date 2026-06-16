"use client";
import { useEffect, useState } from "react";

export default function WalletPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showTx, setShowTx] = useState(false);
  const [transactions, setTransactions] = useState([]);

  // ✅ NEW: FILTER STATE
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  // ================= CREDIT =================
  const handleCredit = async (userId) => {
    const amount = prompt("Enter amount to credit:");
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

  // ================= DEBIT =================
  const handleDebit = async (userId) => {
    const amount = prompt("Enter amount to debit:");
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

  // ================= TRANSACTIONS =================
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

      // reset filters when opening
      setFromDate("");
      setToDate("");

    } catch {
      alert("Server error");
    }
  };

  // ✅ FILTER LOGIC
  const filteredTransactions = transactions.filter((t) => {
    if (!fromDate && !toDate) return true;

    const txDate = new Date(t.createdAt);

    if (fromDate && txDate < new Date(fromDate)) return false;
    if (toDate && txDate > new Date(toDate + "T23:59:59")) return false;

    return true;
  });

  return (
    <div style={container}>
      <h1 style={title}>💰 Wallet Management</h1>

      <div style={grid}>
        {users.map((u) => (
          <div key={u._id} style={card}>
            <h3>{u.name}</h3>
            <p style={email}>{u.email}</p>

            <p style={balance}>
              Balance: ₹{u.wallet?.balance || 0}
            </p>

            <div style={btnRow}>
              <button onClick={() => handleCredit(u._id)} style={creditBtn}>
                ➕ Credit
              </button>

              <button onClick={() => handleDebit(u._id)} style={debitBtn}>
                ➖ Debit
              </button>
            </div>

            <button
              style={txBtn}
              onClick={() => handleTransactionHistory(u._id)}
            >
              📜 Transactions
            </button>
          </div>
        ))}
      </div>

      {/* TRANSACTION MODAL */}
      {showTx && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2>Transaction History</h2>

            {/* ✅ DATE FILTER UI */}
            <div style={filterRow}>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={input}
              />

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={input}
              />
            </div>

            {filteredTransactions.length === 0 ? (
              <p>No transactions found</p>
            ) : (
              filteredTransactions.map((t, i) => (
                <div key={i} style={txItem}>
                  <div style={txRow}>
                    <span
                      style={{
                        color: t.type === "credit" ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
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
// 🎨 STYLES (ONLY SMALL ADD)
//

const container = {
  padding: "30px",
  background: "#f5f6fa",
  minHeight: "100vh",
  paddingTop: "80px",
};

const title = {
  textAlign: "center",
  marginBottom: "20px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px",
};

const card = {
  background: "#fff",
  padding: "15px",
  borderRadius: "12px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
};

const email = { color: "gray", fontSize: "12px" };

const balance = {
  fontWeight: "bold",
  marginTop: "10px",
};

const btnRow = {
  display: "flex",
  gap: "10px",
  marginTop: "10px",
};

const creditBtn = {
  flex: 1,
  background: "green",
  color: "#fff",
};

const debitBtn = {
  flex: 1,
  background: "red",
  color: "#fff",
};

const txBtn = {
  marginTop: "10px",
  width: "100%",
  background: "#667eea",
  color: "#fff",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "350px",
};

const filterRow = {
  display: "flex",
  gap: "10px",
  marginBottom: "10px",
};

const input = {
  flex: 1,
  padding: "5px",
};

const txItem = { padding: "10px", borderBottom: "1px solid #eee" };
const txRow = { display: "flex", justifyContent: "space-between" };
const date = { fontSize: "12px", color: "gray" };
const closeBtn = { marginTop: "10px", width: "100%" };