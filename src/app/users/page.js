"use client";
import { useEffect, useState } from "react";

export default function UsersPage() {

  const [users, setUsers] = useState([]);

  const [editUser, setEditUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    pan: "",
    aadhaar: "",
    aiScore: ""
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // 🤖 AI CREDIT SCORE CALCULATION
  const calculateAiScore = (u) => {

    let score = 500;

    // WALLET BALANCE ANALYSIS
    if ((u.wallet?.balance || 0) > 50000)
      score += 120;

    else if ((u.wallet?.balance || 0) > 10000)
      score += 70;

    else
      score += 20;

    // KYC ANALYSIS
    if (u.kyc?.pan)
      score += 80;

    if (u.kyc?.aadhaar)
      score += 80;

    // USER STATUS ANALYSIS
    if (u.status === "active")
      score += 100;

    if (u.status === "blocked")
      score -= 150;

    if (u.status === "suspended")
      score -= 80;

    // AI RANDOM TRUST ANALYSIS
    score += Math.floor(Math.random() * 50);

    // MAX LIMIT
    if (score > 900)
      score = 900;

    return score;
  };

  const loadUsers = async () => {

    const res = await fetch(
      "http://localhost:3000/api/users/list",
      {
        headers: {
          Authorization:
            "Bearer " +
            localStorage.getItem("token"),
        },
      }
    );

    const data = await res.json();

    // 🤖 AUTO GENERATE AI SCORE
    const usersWithScore = (data.users || []).map(
      (u) => ({
        ...u,
        aiCreditScore: calculateAiScore(u),
      })
    );

    setUsers(usersWithScore);
  };

  const handleStatusChange = async (
    userId,
    status
  ) => {

    const res = await fetch(
      "http://localhost:3000/api/users/status",
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            "Bearer " +
            localStorage.getItem("token"),
        },

        body: JSON.stringify({
          userId,
          status,
        }),
      }
    );

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
      aadhaar: u.kyc?.aadhaar || "",
      aiScore: u.aiCreditScore || ""
    });
  };

  const handleUpdate = async () => {

    // FRONTEND UPDATE FOR DEMO
    const updatedUsers = users.map((u) =>
      u._id === editUser
        ? {
            ...u,
            name: form.name,
            email: form.email,
            aiCreditScore: form.aiScore,

            kyc: {
              ...u.kyc,
              pan: form.pan,
              aadhaar: form.aadhaar,
            },
          }
        : u
    );

    setUsers(updatedUsers);

    alert("User Updated Successfully");

    setEditUser(null);
  };

  const handleDelete = async () => {

    if (
      !confirm(
        "Are you sure to delete this user?"
      )
    )
      return;

    const res = await fetch(
      "http://localhost:3000/api/users/delete",
      {
        method: "DELETE",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            "Bearer " +
            localStorage.getItem("token"),
        },

        body: JSON.stringify({
          userId: editUser,
        }),
      }
    );

    const data = await res.json();

    alert(data.message);

    setEditUser(null);

    loadUsers();
  };

  // SCORE COLOR
  const getScoreColor = (score) => {

    if (score >= 750)
      return "#16a34a";

    if (score >= 650)
      return "#f59e0b";

    return "#ef4444";
  };

  // SCORE STATUS
  const getScoreText = (score) => {

    if (score >= 750)
      return "Excellent";

    if (score >= 650)
      return "Good";

    return "Risky";
  };

  return (
    <div style={container}>

      <h1 style={title}>
        👤 User Management
      </h1>

      <div style={grid}>

        {users.map((u) => (

          <div key={u._id} style={card}>

            {/* HEADER */}
            <div style={header}>

              <div style={avatar}>
                {u.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>

                <h3>{u.name}</h3>

                <p style={email}>
                  {u.email}
                </p>

                <p style={kycText}>
                  PAN:
                  {" "}
                  {u.kyc?.pan ||
                    "Not Provided"}
                </p>

                <p style={kycText}>
                  Aadhaar:
                  {" "}
                  {u.kyc?.aadhaar ||
                    "Not Provided"}
                </p>
              </div>

              <span
                style={editIcon}
                onClick={() => openEdit(u)}
              >
                ✏️
              </span>

              <span style={statusBadge(u.status)}>
                {u.status || "active"}
              </span>
            </div>

            {/* 🤖 AI CREDIT SCORE */}
            <div style={scoreBox}>

              <div
                style={{
                  ...scoreCircle,

                  borderColor:
                    getScoreColor(
                      u.aiCreditScore
                    ),

                  color:
                    getScoreColor(
                      u.aiCreditScore
                    ),
                }}
              >
                {u.aiCreditScore}
              </div>

              <div>

                <h4 style={{ margin: 0 }}>
                  🤖 AI Credit Score
                </h4>

                <p
                  style={{
                    color:
                      getScoreColor(
                        u.aiCreditScore
                      ),

                    fontWeight: "bold",

                    marginTop: "5px",
                  }}
                >
                  {getScoreText(
                    u.aiCreditScore
                  )}
                </p>

                <p style={aiText}>
                  AI analyzed KYC,
                  wallet balance &
                  activity
                </p>
              </div>
            </div>

            {/* BUTTONS */}
            <div style={statusRow}>

              <button
                onClick={() =>
                  handleStatusChange(
                    u._id,
                    "active"
                  )
                }

                style={activeBtn}
              >
                Active
              </button>

              <button
                onClick={() =>
                  handleStatusChange(
                    u._id,
                    "blocked"
                  )
                }

                style={blockBtn}
              >
                Block
              </button>

              <button
                onClick={() =>
                  handleStatusChange(
                    u._id,
                    "suspended"
                  )
                }

                style={suspendBtn}
              >
                Suspend
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editUser && (

        <div style={modalOverlay}>

          <div style={modal}>

            <h2>Edit User</h2>

            <input
              placeholder="Name"

              value={form.name}

              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }

              style={input}
            />

            <input
              placeholder="Email"

              value={form.email}

              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }

              style={input}
            />

            <input
              placeholder="PAN"

              value={form.pan}

              onChange={(e) =>
                setForm({
                  ...form,
                  pan: e.target.value,
                })
              }

              style={input}
            />

            <input
              placeholder="Aadhaar"

              value={form.aadhaar}

              onChange={(e) =>
                setForm({
                  ...form,
                  aadhaar:
                    e.target.value,
                })
              }

              style={input}
            />

            <input
              placeholder="AI Credit Score"

              value={form.aiScore}

              onChange={(e) =>
                setForm({
                  ...form,
                  aiScore:
                    e.target.value,
                })
              }

              style={input}
            />

            <div style={modalBtns}>

              <button
                onClick={handleUpdate}
                style={saveBtn}
              >
                Update
              </button>

              <button
                onClick={handleDelete}
                style={deleteBtn}
              >
                Delete
              </button>

              <button
                onClick={() =>
                  setEditUser(null)
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//
// 🎨 STYLES
//

const container = {
  padding: "30px",

  background:
    "linear-gradient(135deg,#eef2ff,#f9fafc)",

  minHeight: "100vh",
  paddingTop: "80px",
};

const title = {
  textAlign: "center",
  marginBottom: "30px",
};

const grid = {
  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",

  gap: "25px",
};

const card = {
  background: "#fff",

  padding: "20px",

  borderRadius: "18px",

  boxShadow:
    "0 10px 25px rgba(0,0,0,0.08)",
};

const header = {
  display: "flex",

  alignItems: "center",

  gap: "10px",
};

const avatar = {
  width: 50,
  height: 50,

  borderRadius: "50%",

  background:
    "linear-gradient(135deg,#667eea,#764ba2)",

  color: "#fff",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  fontWeight: "bold",

  fontSize: "18px",
};

const email = {
  fontSize: "12px",
  color: "gray",
};

const kycText = {
  fontSize: "12px",
  color: "#555",
  margin: "2px 0",
};

const aiText = {
  fontSize: "12px",
  color: "#666",
};

const editIcon = {
  cursor: "pointer",
  fontSize: "18px",
};

const statusBadge = (status) => ({
  padding: "5px 10px",

  borderRadius: "20px",

  background:
    status === "blocked"
      ? "#ffe5e5"
      : status === "suspended"
      ? "#fff4e5"
      : "#e6f7ee",

  color:
    status === "blocked"
      ? "red"
      : status === "suspended"
      ? "orange"
      : "green",

  fontSize: "12px",
});

const scoreBox = {
  marginTop: "18px",

  display: "flex",

  alignItems: "center",

  gap: "15px",

  padding: "15px",

  borderRadius: "15px",

  background: "#f8fafc",
};

const scoreCircle = {
  width: "75px",

  height: "75px",

  borderRadius: "50%",

  border: "6px solid",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  fontWeight: "bold",

  fontSize: "18px",

  background: "#fff",
};

const statusRow = {
  display: "flex",

  gap: "8px",

  marginTop: "20px",
};

const activeBtn = {
  flex: 1,

  background: "#16a34a",

  color: "#fff",

  border: "none",

  padding: "10px",

  borderRadius: "10px",

  cursor: "pointer",
};

const blockBtn = {
  flex: 1,

  background: "#dc2626",

  color: "#fff",

  border: "none",

  padding: "10px",

  borderRadius: "10px",

  cursor: "pointer",
};

const suspendBtn = {
  flex: 1,

  background: "#f59e0b",

  color: "#fff",

  border: "none",

  padding: "10px",

  borderRadius: "10px",

  cursor: "pointer",
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

  padding: "25px",

  borderRadius: "16px",

  width: "350px",
};

const input = {
  width: "100%",

  padding: "10px",

  marginBottom: "12px",

  borderRadius: "8px",

  border: "1px solid #ddd",
};

const modalBtns = {
  display: "flex",

  gap: "10px",
};

const saveBtn = {
  background: "#2563eb",

  color: "#fff",

  border: "none",

  padding: "10px",

  borderRadius: "8px",

  cursor: "pointer",
};

const deleteBtn = {
  background: "#dc2626",

  color: "#fff",

  border: "none",

  padding: "10px",

  borderRadius: "8px",

  cursor: "pointer",
};