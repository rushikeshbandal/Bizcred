"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function UserNavbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const pathname = usePathname();

  const dropdownRef = useRef();
  const timeoutRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("http://localhost:3000/api/users/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        });
    }
  }, []);

  // CLOSE DROPDOWN OUTSIDE CLICK
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  // HIDE NAVBAR ON LOGIN PAGE
  if (pathname === "/login") return null;

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // DROPDOWN HOVER
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
      
      {/* LEFT SIDE */}
      <div style={leftSection}>
        
        {/* LOGO */}
        <img
          src="/BizCred-logo.png"
          alt="BizCred Logo"
          style={logo}
          onClick={() => router.push("/user-dashboard")}
        />

       
      </div>
      
      {/* RIGHT SIDE */}
      <div
        ref={dropdownRef}
        style={userBox}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* USER AVATAR */}
        <div
          style={avatar}
          onClick={() => setOpen(!open)}
        >
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        {/* DROPDOWN */}
        {open && (
          <div style={dropdown}>

            <div style={userInfo}>
              <p style={name}>
                {user?.name || "User"}
              </p>

              <p style={email}>
                {user?.email || "user@email.com"}
              </p>
            </div>

            <div style={divider}></div>

            <p
              style={dropdownItem}
              onClick={() =>
                router.push("/user-dashboard")
              }
            >
              🏠 Dashboard
            </p>

            <p
              style={dropdownItem}
              onClick={() => router.push("/kyc")}
            >
              🪪 KYC Verification
            </p>

            <p
              style={dropdownItem}
              onClick={() => router.push("/profile")}
            >
              👤 My Profile
            </p>

            <div style={divider}></div>

            <p
              onClick={logout}
              style={{
                ...dropdownItem,
                color: "red",
              }}
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
  left: 0,
  width: "100%",
  height: "70px",
  background:
    "linear-gradient(90deg,#4f46e5,#7c3aed)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 30px",
  zIndex: 1000,
  boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
};

const leftSection = {
  display: "flex",
  alignItems: "center",
  gap: "40px",
};

const logo = {
  height: "42px",
  objectFit: "contain",
  cursor: "pointer",
};

const menu = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
};

const menuItem = {
  color: "#fff",
  cursor: "pointer",
  fontWeight: "500",
  padding: "8px 14px",
  borderRadius: "8px",
  transition: "0.3s",
};

const activeMenu = {
  background: "rgba(255,255,255,0.2)",
};

const userBox = {
  position: "relative",
  marginRight: "50px",
};

const avatar = {
  width: "44px",
  height: "44px",
  borderRadius: "50%",
  background: "#fff",
  color: "#4f46e5",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: "bold",
  fontSize: "18px",
  cursor: "pointer",
};

const dropdown = {
  position: "absolute",
  top: "58px",
  right: 0,
  width: "240px",
  background: "#fff",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const userInfo = {
  padding: "18px",
  textAlign: "center",
};

const name = {
  margin: 0,
  fontWeight: "bold",
  color: "#4f46e5",
  fontSize: "16px",
};

const email = {
  marginTop: "5px",
  fontSize: "12px",
  color: "gray",
};

const dropdownItem = {
  padding: "14px 18px",
  cursor: "pointer",
  fontSize: "15px",
  transition: "0.2s",
};

const divider = {
  height: "1px",
  background: "#eee",
};