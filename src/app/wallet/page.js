"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-components/AdminShell";

export default function WalletPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showTx, setShowTx] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const res = await fetch("/api/users/list", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });

    const data = await res.json();
    setUsers(data.users || []);
  };

  const handleCredit = async (userId) => {
    const amount = prompt("Enter amount to credit:");
    if (!amount) return;

    setLoading(true);

    const res = await fetch("/api/wallet/credit", {
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
    const amount = prompt("Enter amount to debit:");
    if (!amount) return;

    setLoading(true);

    const res = await fetch("/api/wallet/debit", {
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

  const handleTransactionHistory = async (userId) => {
    try {
      const res = await fetch(`/api/transactions/user?userId=${userId}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        alert(data.message || "Error fetching transactions");
        return;
      }

      setTransactions(data.transactions || []);
      setShowTx(true);
      setFromDate("");
      setToDate("");
    } catch {
      alert("Server error");
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (!fromDate && !toDate) return true;

    const txDate = new Date(t.createdAt);

    if (fromDate && txDate < new Date(fromDate)) return false;
    if (toDate && txDate > new Date(toDate + "T23:59:59")) return false;

    return true;
  });

  return (
    <AdminShell pageTitle="💰 Wallet Management" pageSubtitle="Credit, debit, and review customer wallet balances">
      <div style={grid}>
        {users.map((u) => (
          <div key={u._id} style={card}>
            <h3 style={{ margin: 0 }}>{u.name}</h3>
            <p style={email}>{u.email}</p>

            <p style={balance}>Balance: ₹{(u.wallet?.balance || 0).toLocaleString("en-IN")}</p>

            <div style={btnRow}>
              <button onClick={() => handleCredit(u._id)} style={creditBtn} disabled={loading}>
                ➕ Credit
              </button>

              <button onClick={() => handleDebit(u._id)} style={debitBtn} disabled={loading}>
                ➖ Debit
              </button>
            </div>

            <button style={txBtn} onClick={() => handleTransactionHistory(u._id)}>
              📜 Transactions
            </button>
          </div>
        ))}
      </div>

      {showTx && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2 style={{ marginTop: 0 }}>Transaction History</h2>

            <div style={filterRow}>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={input} />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={input} />
            </div>

            {filteredTransactions.length === 0 ? (
              <p style={emptyText}>No transactions found</p>
            ) : (
              filteredTransactions.map((t, i) => (
                <div key={i} style={txItem}>
                  <div style={txRow}>
                    <span style={{ color: t.type === "credit" ? "#16a34a" : "#dc2626", fontWeight: "bold" }}>
                      {t.type.toUpperCase()}
                    </span>
                    <span>₹{t.amount}</span>
                  </div>
                  <p style={date}>{new Date(t.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}

            <button onClick={() => setShowTx(false)} style={closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" };

const card = { background: "#fff", padding: "20px", borderRadius: "16px", boxShadow: "0 5px 15px rgba(0,0,0,0.06)" };

const email = { color: "gray", fontSize: "12px", margin: "4px 0" };
const balance = { fontWeight: "bold", marginTop: "10px", fontSize: "15px" };

const btnRow = { display: "flex", gap: "10px", marginTop: "14px" };

const creditBtn = { flex: 1, background: "#16a34a", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 };
const debitBtn = { flex: 1, background: "#dc2626", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 };
const txBtn = { marginTop: "10px", width: "100%", background: "#667eea", color: "#fff", border: "none", padding: "10px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 };

const modalOverlay = {
  position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
  background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000,
};

const modal = { background: "#fff", padding: "22px", borderRadius: "14px", width: "380px", maxHeight: "80vh", overflowY: "auto" };

const filterRow = { display: "flex", gap: "10px", marginBottom: "14px" };
const input = { flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ddd" };

const txItem = { padding: "10px 0", borderBottom: "1px solid #eee" };
const txRow = { display: "flex", justifyContent: "space-between" };
const date = { fontSize: "12px", color: "gray", margin: "4px 0 0" };
const emptyText = { textAlign: "center", color: "#9ca3af", padding: "20px 0" };
const closeBtn = { marginTop: "14px", width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "8px", background: "#fff", cursor: "pointer", fontWeight: 600 };