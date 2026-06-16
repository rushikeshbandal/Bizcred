"use client";
import { useEffect, useState } from "react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const res = await fetch("http://localhost:3000/api/transactions/all", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    const data = await res.json();
    setTransactions(data.transactions || []);
    setFiltered(data.transactions || []);
  };

  // ✅ FILTER
  const applyFilter = () => {
    let temp = [...transactions];

    if (fromDate) {
      temp = temp.filter(
        (t) => new Date(t.createdAt) >= new Date(fromDate)
      );
    }

    if (toDate) {
      temp = temp.filter(
        (t) =>
          new Date(t.createdAt) <= new Date(toDate + "T23:59:59")
      );
    }

    setFiltered(temp);
  };

  const clearFilter = () => {
    setFromDate("");
    setToDate("");
    setFiltered(transactions);
  };

  return (
    <div style={container}>
      <h1 style={title}>📜 Transaction History</h1>

      {/* FILTER */}
      <div style={filterBox}>
        <input type="date" value={fromDate}
          onChange={(e) => setFromDate(e.target.value)} style={input} />

        <input type="date" value={toDate}
          onChange={(e) => setToDate(e.target.value)} style={input} />

        <button onClick={applyFilter} style={applyBtn}>Apply</button>
        <button onClick={clearFilter} style={clearBtn}>Clear</button>
      </div>

      {/* HEADER ROW */}
      <div style={tableHeader}>
        <span>User</span>
        <span>Type</span>
        <span>Amount</span>
        <span>Date</span>
      </div>

      {/* LIST */}
      <div>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center" }}>No transactions found</p>
        ) : (
          filtered.map((t, i) => (
            <div key={i} style={row}>

              <span>
                <b>{t.user?.name}</b>
                <p style={email}>{t.user?.email}</p>
              </span>

              <span style={{
                color: t.type === "credit" ? "green" : "red",
                fontWeight: "bold"
              }}>
                {t.type.toUpperCase()}
              </span>

              <span style={{
                color: t.type === "credit" ? "green" : "red"
              }}>
                ₹{t.amount}
              </span>

              <span style={date}>
                {new Date(t.createdAt).toLocaleString()}
              </span>

            </div>
          ))
        )}
      </div>
    </div>
  );
}

//
// 🎨 STYLES (LINE TABLE STYLE)
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

const filterBox = {
  display: "flex",
  gap: "10px",
  justifyContent: "center",
  marginBottom: "20px",
  flexWrap: "wrap",
};

const input = {
  padding: "6px",
};

const applyBtn = {
  background: "#667eea",
  color: "#fff",
  padding: "6px 12px",
};

const clearBtn = {
  background: "gray",
  color: "#fff",
  padding: "6px 12px",
};

const tableHeader = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 2fr",
  padding: "10px",
  fontWeight: "bold",
  borderBottom: "2px solid #ddd",
};

const row = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr 1fr 2fr",
  padding: "12px 10px",
  borderBottom: "1px solid #eee",
  alignItems: "center",
};

const email = {
  fontSize: "11px",
  color: "gray",
};

const date = {
  fontSize: "12px",
  color: "gray",
};