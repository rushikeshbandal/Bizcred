"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem("customerToken");

    if (!token) {
      router.push("/customer/login");
      return;
    }

    try {
      const res = await fetch("/api/customer/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        router.push("/customer/login");
        return;
      }

      setUser(data.user);
    } catch (err) {
      console.log(err);
      router.push("/customer/login");
    }
  };

  if (!user) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img
          src="/BizCred-logo.png"
          alt="BizCred"
          style={styles.logo}
        />

        <h2>Customer Profile</h2>

        <table style={styles.table}>
          <tbody>
            <tr>
              <td><b>Name</b></td>
              <td>{user.name}</td>
            </tr>

            <tr>
              <td><b>Email</b></td>
              <td>{user.email}</td>
            </tr>

            <tr>
              <td><b>Mobile</b></td>
              <td>{user.mobile}</td>
            </tr>

            <tr>
              <td><b>Date of Birth</b></td>
              <td>{user.dob?.substring(0, 10) || "-"}</td>
            </tr>

            <tr>
              <td><b>Gender</b></td>
              <td>{user.gender || "-"}</td>
            </tr>

            <tr>
              <td><b>Address</b></td>
              <td>{user.address || "-"}</td>
            </tr>

            <tr>
              <td><b>City</b></td>
              <td>{user.city || "-"}</td>
            </tr>

            <tr>
              <td><b>State</b></td>
              <td>{user.state || "-"}</td>
            </tr>

            <tr>
              <td><b>Pincode</b></td>
              <td>{user.pincode || "-"}</td>
            </tr>

            <tr>
              <td><b>PAN</b></td>
              <td>{user.kyc?.pan || "-"}</td>
            </tr>

            <tr>
              <td><b>Aadhaar</b></td>
              <td>{user.kyc?.aadhaar || "-"}</td>
            </tr>

            <tr>
              <td><b>KYC Status</b></td>
              <td>{user.kyc?.status}</td>
            </tr>

            <tr>
              <td><b>Wallet Balance</b></td>
              <td>₹ {user.wallet?.balance || 0}</td>
            </tr>

            <tr>
              <td><b>Account Status</b></td>
              <td>{user.status}</td>
            </tr>
          </tbody>
        </table>

        <button
          style={styles.button}
          onClick={() => router.push("/customer/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4f6fa",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
  },

  card: {
    width: "700px",
    background: "#fff",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 5px 20px rgba(0,0,0,.1)",
  },

  logo: {
    width: "170px",
    display: "block",
    margin: "0 auto 20px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },

  button: {
    marginTop: "25px",
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  },
};