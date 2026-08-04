"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Decodes the JWT payload (base64) without needing an extra library —
// just reads the middle segment of header.payload.signature.
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export default function AdminShell({ children, pageTitle, pageSubtitle, topRight }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [admin, setAdmin] = useState({ name: "Admin", email: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const decoded = decodeToken(token);
    if (decoded?.name) {
      setAdmin({ name: decoded.name, email: decoded.email || "" });
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div style={loadingScreen}>
        <p>Checking access...</p>
      </div>
    );
  }

  const initial = admin.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <div style={container}>
      {/* SIDEBAR */}
      <div style={sidebar}>
        <div>
          <div style={logoWrap}>
            <img src="/BizCred-logo.png" alt="BizCred" style={logoImg} />
          </div>

          <SidebarItem text="📊 Dashboard" path="/dashboard" />
          <SidebarItem text="👥 Users" path="/users" />
          <SidebarItem text="📜 Transactions" path="/transactions" />
          <SidebarItem text="💰 Wallet" path="/wallet" />
          <SidebarItem text="🧾 KYC" path="/kyc" />
          <SidebarItem text="⚙️ Settings" path="/settings" />
          <SidebarItem text="🔐 Security" path="/security" />
          <SidebarItem text="📩 Support" path="/support" />
        </div>

        <div style={bottomBox}>
          <h4 style={{ margin: "0 0 6px" }}>Admin Panel</h4>
          <p style={{ fontSize: "13px", opacity: 0.8, margin: 0 }}>
            Manage users, wallet, KYC and analytics
          </p>
          <p
            style={logoutLink}
            onClick={() => {
              localStorage.removeItem("token");
              location.href = "/login";
            }}
          >
            🚪 Logout
          </p>
        </div>
      </div>

      {/* MAIN */}
      <div style={main}>
        <div style={topbar}>
          <div>
            <h1 style={heading}>{pageTitle}</h1>
            {pageSubtitle && <p style={subHeading}>{pageSubtitle}</p>}
          </div>

          <div style={topRightWrap}>
            {topRight}
            <div style={adminProfile}>
              <div style={avatar}>{initial}</div>
              <div>
                <h4 style={{ margin: 0 }}>{admin.name}</h4>
                <p style={role}>Super Admin</p>
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

function SidebarItem({ text, path }) {
  return (
    <p
      style={menuItem}
      onClick={() => (location.href = path)}
      onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
    >
      {text}
    </p>
  );
}

const loadingScreen = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  fontFamily: "Arial",
  color: "#6b7280",
};

const container = {
  display: "flex",
  minHeight: "100vh",
  background: "#f4f7fe",
  fontFamily: "Arial",
};

const sidebar = {
  width: "250px",
  background: "linear-gradient(180deg,#111827,#1f2937)",
  color: "#fff",
  padding: "25px 20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  position: "sticky",
  top: 0,
  height: "100vh",
};

const logoWrap = {
  marginBottom: "28px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#ffffff",
  borderRadius: "12px",
  padding: "14px 20px",
};

const logoImg = {
  height: "36px",
  width: "auto",
  maxWidth: "100%",
  objectFit: "contain",
  cursor: "pointer",
  display: "block",
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

const logoutLink = {
  fontSize: "13px",
  color: "#f87171",
  cursor: "pointer",
  marginTop: "10px",
  fontWeight: 600,
};

const main = { flex: 1, padding: "25px", overflowY: "auto" };

const topbar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
  flexWrap: "wrap",
  gap: "20px",
};

const heading = { margin: 0 };
const subHeading = { color: "#666", margin: "4px 0 0" };

const topRightWrap = { display: "flex", alignItems: "center", gap: "15px" };

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

const role = { margin: 0, fontSize: "12px", color: "#777" };