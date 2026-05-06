"use client";
import { useEffect, useState } from "react";

export default function UsersPage() {

  const [users, setUsers] = useState([]);

  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    pan: "",
    aadhaar: ""
  });

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

  const openEdit = (u) => {
    setEditUser(u._id);
    setForm({
      name: u.name || "",
      email: u.email || "",
      pan: u.kyc?.pan || "",
      aadhaar: u.kyc?.aadhaar || ""
    });
  };

  const handleUpdate = async () => {
    const res = await fetch("http://localhost:3000/api/users/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        userId: editUser,
        ...form
      }),
    });

    const data = await res.json();
    alert(data.message);

    setEditUser(null);
    loadUsers();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure to delete this user?")) return;

    const res = await fetch("http://localhost:3000/api/users/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ userId: editUser }),
    });

    const data = await res.json();
    alert(data.message);

    setEditUser(null);
    loadUsers();
  };

  return (
    <div style={container}>
      <h1 style={title}>👤 User Management</h1>

      <div style={grid}>
        {users.map((u) => (
          <div key={u._id} style={card}>

            <div style={header}>
              <div style={avatar}>
                {u.name?.charAt(0)?.toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <h3>{u.name}</h3>
                <p style={email}>{u.email}</p>

                {/* ✅ NEW KYC DISPLAY */}
                <p style={kycText}>
                  PAN: {u.kyc?.pan || "Not Provided"}
                </p>
                <p style={kycText}>
                  Aadhaar: {u.kyc?.aadhaar || "Not Provided"}
                </p>
              </div>

              <span style={editIcon} onClick={() => openEdit(u)}>✏️</span>

              <span style={statusBadge(u.status)}>
                {u.status || "active"}
              </span>
            </div>

            <div style={statusRow}>
              <button onClick={() => handleStatusChange(u._id, "active")} style={activeBtn}>Active</button>
              <button onClick={() => handleStatusChange(u._id, "blocked")} style={blockBtn}>Block</button>
              <button onClick={() => handleStatusChange(u._id, "suspended")} style={suspendBtn}>Suspend</button>
            </div>

          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editUser && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h2>Edit User</h2>

            <input placeholder="Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} style={input} />

            <input placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} style={input} />

            <input placeholder="PAN" value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value })} style={input} />

            <input placeholder="Aadhaar" value={form.aadhaar}
              onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} style={input} />

            <div style={modalBtns}>
              <button onClick={handleUpdate} style={saveBtn}>Update</button>
              <button onClick={handleDelete} style={deleteBtn}>Delete</button>
              <button onClick={() => setEditUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//
// 🎨 STYLES (ONLY ONE NEW STYLE ADDED)
//

const container = {
  padding: "30px",
  background: "linear-gradient(135deg,#eef2ff,#f9fafc)",
  minHeight: "100vh"
};

const title = {
  textAlign: "center",
  marginBottom: "30px"
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "25px"
};

const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
};

const header = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const avatar = {
  width: 45,
  height: 45,
  borderRadius: "50%",
  background: "linear-gradient(135deg,#667eea,#764ba2)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const email = { fontSize: "12px", color: "gray" };

/* ✅ NEW STYLE */
const kycText = { fontSize: "12px", color: "#555", margin: "2px 0" };

const editIcon = { cursor: "pointer", fontSize: "18px" };

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

const statusRow = {
  display: "flex",
  gap: "6px",
  marginTop: "10px"
};

const activeBtn = { flex: 1, background: "green", color: "#fff" };
const blockBtn = { flex: 1, background: "red", color: "#fff" };
const suspendBtn = { flex: 1, background: "orange", color: "#fff" };

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
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

const input = {
  width: "100%",
  padding: "8px",
  marginBottom: "10px"
};

const modalBtns = {
  display: "flex",
  gap: "10px"
};

const saveBtn = {
  background: "blue",
  color: "#fff",
  border: "none",
  padding: "8px"
};

const deleteBtn = {
  background: "red",
  color: "#fff",
  border: "none",
  padding: "8px"
};