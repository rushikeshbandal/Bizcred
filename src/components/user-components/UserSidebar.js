"use client";

import { useRouter } from "next/navigation";

export default function UserSidebar() {

  const router = useRouter();

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    router.push("/user-login");
  };

  return (

    <div style={sidebar}>

      <h2 style={title}>
        👤 User Panel
      </h2>

      {/* DASHBOARD */}
      <div
        style={menuItem}
        onClick={() =>
          router.push("/user-dashboard")
        }
      >
        📊 Dashboard
      </div>

      {/* KYC */}
      <div
        style={menuItem}
        onClick={() =>
          router.push("/kyc/user-kyc")
        }
      >
        🪪 KYC
      </div>

      {/* WALLET */}
      <div
        style={menuItem}
        onClick={() =>
          router.push("/app/wallet")
        }
      >
        💰 Wallet
      </div>

      {/* TRANSACTIONS */}
      <div
        style={menuItem}
        onClick={() =>
          router.push(
            "/app/transactions"
          )
        }
      >
        💳 Transactions
      </div>

      {/* PROFILE */}
      <div
        style={menuItem}
        onClick={() =>
          router.push("/user-profile")
        }
      >
        ⚙️ Profile
      </div>

      {/* LOGOUT */}
      <div
        style={{
          ...menuItem,
          color: "red",
        }}
        onClick={handleLogout}
      >
        🚪 Logout
      </div>

    </div>
  );
}

const sidebar = {
  width: "220px",
  height: "100vh",
  background: "#111",
  color: "#fff",
  padding: "20px",
  position: "fixed",
  left: 0,
  top: 0,
};

const title = {
  textAlign: "center",
  marginBottom: "30px",
};

const menuItem = {
  padding: "14px",
  marginTop: "12px",
  background: "#7fa7e8",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "500",
  transition: "0.3s",
  border: "1px solid #334155",
};