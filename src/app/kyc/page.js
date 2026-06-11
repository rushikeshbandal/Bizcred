"use client";
import { useEffect, useState } from "react";

export default function KYCPage() {

  const [users, setUsers] = useState([]);

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

  const handleStatus = async (userId, status) => {
    const res = await fetch("http://localhost:3000/api/users/verify", {
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

  return (
    <div style={container}>
      <h1 style={title}>🧾 KYC Verification</h1>

      <div style={grid}>
        {users.map((u) => (
          <div key={u._id} style={card}>
            <h3>{u.name}</h3>
            <p>{u.email}</p>

<p><b>PAN:</b> {u.kyc?.pan || "-"}</p>
<p><b>Aadhaar:</b> {u.kyc?.aadhaar || "-"}</p>

<p><b>PAN Name:</b> {u.kyc?.panName || "-"}</p>
<p><b>PAN Category:</b> {u.kyc?.panCategory || "-"}</p>
<p><b>PAN Status:</b> {u.kyc?.panStatus || "-"}</p>

            <p style={statusStyle(u.kyc?.status)}>
              Status: {u.kyc?.status || "pending"}
            </p>

            <div style={btnRow}>
              <button onClick={() => handleStatus(u._id, "approved")} style={approveBtn}>
                Approve
              </button>
              <button onClick={() => handleStatus(u._id, "rejected")} style={rejectBtn}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

//
// STYLES
//

const container = { padding: "30px", background: "#f5f7fb", minHeight: "100vh" };
const title = { textAlign: "center", marginBottom: "20px" };

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px"
};

const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
};

const statusStyle = (s) => ({
  fontWeight: "bold",
  color:
    s === "approved" ? "green" :
    s === "rejected" ? "red" : "orange"
});

const btnRow = { display: "flex", gap: "10px", marginTop: "10px" };

const approveBtn = { flex: 1, background: "green", color: "#fff", padding: "8px" };
const rejectBtn = { flex: 1, background: "red", color: "#fff", padding: "8px" };