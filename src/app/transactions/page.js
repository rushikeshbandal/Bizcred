"use client";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-components/AdminShell";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const res = await fetch("/api/transactions/all", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    });

    const data = await res.json();
    setTransactions(data.transactions || []);
    setFiltered(data.transactions || []);
  };

  const applyFilter = () => {
    let temp = [...transactions];

    if (fromDate) {
      temp = temp.filter((t) => new Date(t.createdAt) >= new Date(fromDate));
    }

    if (toDate) {
      temp = temp.filter((t) => new Date(t.createdAt) <= new Date(toDate + "T23:59:59"));
    }

    setFiltered(temp);
  };

  const clearFilter = () => {
    setFromDate("");
    setToDate("");
    setFiltered(transactions);
  };

  return (
    <AdminShell pageTitle="📜 Transaction History" pageSubtitle="All wallet credits and debits across every customer">
      <div style={filterCard}>
        <div style={filterBox}>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={input} />
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={input} />
          <button onClick={applyFilter} style={applyBtn}>Apply</button>
          <button onClick={clearFilter} style={clearBtn}>Clear</button>
        </div>
      </div>

      <div style={tableCard}>
        <div style={tableHeader}>
          <span>User</span>
          <span>Type</span>
          <span>Amount</span>
          <span>Date</span>
        </div>

        {filtered.length === 0 ? (
          <p style={emptyText}>No transactions found</p>
        ) : (
          filtered.map((t, i) => (
            <div key={i} style={row}>
              <span>
                <b>{t.user?.name}</b>
                <p style={email}>{t.user?.email}</p>
              </span>

              <span style={{ color: t.type === "credit" ? "#16a34a" : "#dc2626", fontWeight: "bold" }}>
                {t.type.toUpperCase()}
              </span>

              <span style={{ color: t.type === "credit" ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                ₹{t.amount}
              </span>

              <span style={date}>{new Date(t.createdAt).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}

const filterCard = { background: "#fff", padding: "16px 20px", borderRadius: "14px", marginBottom: "20px", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" };

const filterBox = { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" };

const input = { padding: "9px 12px", borderRadius: "8px", border: "1px solid #ddd" };

const applyBtn = { background: "#667eea", color: "#fff", border: "none", padding: "9px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 };
const clearBtn = { background: "#9ca3af", color: "#fff", border: "none", padding: "9px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: 600 };

const tableCard = { background: "#fff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 5px 15px rgba(0,0,0,0.05)" };

const tableHeader = {
  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", padding: "14px 18px",
  fontWeight: "bold", fontSize: "12.5px", color: "#6b7280", textTransform: "uppercase",
  letterSpacing: "0.4px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb",
};

const row = { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr", padding: "14px 18px", borderBottom: "1px solid #f3f4f6", alignItems: "center" };

const email = { fontSize: "11px", color: "gray", margin: "2px 0 0" };
const date = { fontSize: "12px", color: "gray" };
const emptyText = { textAlign: "center", color: "#9ca3af", padding: "30px 0" };