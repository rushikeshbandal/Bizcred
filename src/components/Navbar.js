"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // ✅ STATIC ADMIN USER
  const [user, setUser] = useState({
    name: "Admin",
    email: "admin@bizcred.com",
  });

  const router = useRouter();
  const pathname = usePathname();

  const dropdownRef = useRef();
  const timeoutRef = useRef();

  // CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  // HIDE NAVBAR ON LOGIN PAGE
if (
  pathname === "/login" || pathname === "/customer/register" || pathname === "/customer/login" ||pathname === "/customer/dashboard"
) {
  return null;
}
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
  };

  return (
    <div style={nav}>
      
      {/* ✅ LOGO */}
      <img
        src="/BizCred-logo.png"
        alt="BizCred Logo"
        style={logoImg}
        onClick={() => router.push("/dashboard")}
      />

      {/* USER SECTION */}
      <div
        ref={dropdownRef}
        style={userBox}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* AVATAR */}
        <div style={avatar} onClick={() => setOpen(!open)}>
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>

        {/* DROPDOWN */}
        {open && (
          <div style={dropdown}>
            
            <p style={name}>{user?.name}</p>
            <p style={email}>{user?.email}</p>

            <div style={divider}></div>

            <p
              onClick={() => router.push("/dashboard")}
              style={item}
            >
              📊 Dashboard
            </p>

            <p
              onClick={() => router.push("/users")}
              style={item}
            >
              👥 Users
            </p>

            <p
              onClick={() => router.push("/transactions")}
              style={item}
            >
              📜 Transactions
            </p>

            <p
              onClick={() => router.push("/wallet")}
              style={item}
            >
              💰 Wallet
            </p>

            <p
              onClick={() => router.push("/kyc")}
              style={item}
            >
              🧾 KYC
            </p>

            <p
              onClick={() => router.push("/add-user")}
              style={item}
            >
              ➕ Add User
            </p>

            <div style={divider}></div>

            <p
              onClick={logout}
              style={{ ...item, color: "red" }}
            >
              🚪 Logout
            </p>

          </div>
        )}
      </div>
    </div>
  );
}

//
// 🎨 STYLES
//

const nav = {
  position: "fixed",
  top: 0,
  width: "100%",
  background: "linear-gradient(90deg,#667eea,#764ba2)",
  color: "#fff",
  padding: "12px 25px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  zIndex: 1000,
  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
};

const logoImg = {
  height: "42px",
  cursor: "pointer",
  objectFit: "contain",
};

const userBox = {
  position: "relative",
};

const avatar = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: "#fff",
  color: "#667eea",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "18px",
};

const dropdown = {
  position: "absolute",
  right: 0,
  top: 55,
  width: 220,
  background: "#fff",
  color: "#000",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  padding: "10px 0",
};

const name = {
  textAlign: "center",
  fontWeight: "bold",
  color: "#667eea",
};

const email = {
  textAlign: "center",
  fontSize: "12px",
  color: "gray",
  marginBottom: "5px",
};

const item = {
  padding: "12px 16px",
  cursor: "pointer",
  transition: "0.2s",
};

const divider = {
  height: 1,
  background: "#eee",
  margin: "8px 0",
};