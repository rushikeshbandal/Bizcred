"use client";

import UserNavbar from "@/components/user-components/UserNavbar";
import UserSidebar from "@/components/user-components/UserSidebar";

export default function UserDashboard() {

  // Dummy user data instead of API fetch
  const user = {
    name: "Demo User",
    email: "demo@gmail.com",
    walletBalance: 25000,
    kycStatus: "Pending",
  };

  return (
    <div>
      <UserSidebar />

      <UserNavbar />

      <div style={container}>

        <h1>User Dashboard</h1>

        <div style={card}>
          <h2>Welcome, {user.name}</h2>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Wallet Balance:</strong> ₹{user.walletBalance}
          </p>

          <p>
            <strong>KYC Status:</strong> {user.kycStatus}
          </p>
        </div>

      </div>
    </div>
  );
}

const container = {
  padding: "30px",
  backgroundColor: "#f5f5f5",
  minHeight: "100vh",
};

const card = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "10px",
  marginTop: "20px",
  marginLeft: "250px",
  display: "inline-block",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
};