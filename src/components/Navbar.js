"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef();
  const timeoutRef = useRef(); // 🆕 delay control

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("http://localhost:3000/api/users/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
        });
    }
  }, []);

  // ✅ CLOSE when click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (pathname === "/login") return null;

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // 🆕 HANDLE SAFE CLOSE WITH DELAY
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 200); // delay prevents instant close
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
  };

  return (
    <div style={nav}>
      <h2 onClick={() => router.push("/dashboard")} style={logo}>
        💳 BizCred
      </h2>

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
            <p style={name}>{user?.name || "Admin"}</p>
            <p style={email}>{user?.email}</p>

            <div style={divider}></div>

            <p onClick={() => router.push("/dashboard")} style={item}>
              📊 Dashboard
            </p>

            <p onClick={() => router.push("/users")} style={item}>
              👥 Users
            </p>

            <p onClick={() => router.push("/add-user")} style={item}>
              ➕ Add User
            </p>

            <div style={divider}></div>

            <p onClick={logout} style={{ ...item, color: "red" }}>
              🚪 Logout
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

//
// 🎨 STYLES (UNCHANGED LOOK, BETTER UX)
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

const logo = {
  cursor: "pointer",
  fontWeight: "bold",
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
  width: 200,
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
};

const item = {
  padding: "10px 15px",
  cursor: "pointer",
};

const divider = {
  height: 1,
  background: "#eee",
  margin: "8px 0",
};