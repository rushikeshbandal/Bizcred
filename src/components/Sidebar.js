"use client";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  return (
    <div style={sidebar}>
      <h2 style={{ textAlign: "center" }}>⚙️ Admin</h2>

      <div style={menuItem} onClick={() => router.push("/dashboard")}>
        📊 Dashboard
      </div>

      <div style={menuItem} onClick={() => router.push("/users")}>
        👤 Users
      </div>

      <div style={menuItem} onClick={() => router.push("/profile")}>
        ⚙️ Profile
      </div>

      <div
        style={{ ...menuItem, color: "red" }}
        onClick={() => {
          localStorage.removeItem("token");
          router.push("/login");
        }}
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
};

const menuItem = {
  padding: "12px",
  marginTop: "10px",
  background: "#222",
  borderRadius: "6px",
  cursor: "pointer",
};