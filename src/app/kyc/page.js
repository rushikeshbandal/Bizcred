"use client";


import { useState, useEffect } from "react";

export default function Page() {
 const [customers, setCustomers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadCustomers();
}, []);

const loadCustomers = async () => {
  try {
    const res = await fetch("/api/admin/kyc-users", {
      headers: {
        Authorization:
          "Bearer " + localStorage.getItem("token"),
      },
    });

    const data = await res.json();

    setCustomers(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "#28a745";
      case "rejected":
        return "#dc3545";
      case "pending":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  const updateKYCStatus = (id, newStatus) => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === id
        ? { ...customer, kycStatus: newStatus }
        : customer
    );

    setCustomers(updatedCustomers);

    if (selectedCustomer?.id === id) {
      setSelectedCustomer({
        ...selectedCustomer,
        kycStatus: newStatus,
      });
    }
  };
  const fetchDiditDetails = async (sessionId) => {
  try {
    const res = await fetch(
      `/api/admin/kyc-details/${sessionId}`
    );

    const data = await res.json();

    alert(
      `Status: ${data.status || data.decision_status}`
    );
  } catch (error) {
    console.error(error);
  }
};

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "30px auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
      style={{margin:"10px",padding:"10px"}}>Customer KYC Management</h1>

      {/* Customer Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Credit Score</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>

        <tbody>
  {customers.map((customer) => (
    <>
      <tr key={customer.id}>
        <td style={tdStyle}>{customer.id}</td>
        <td style={tdStyle}>{customer.name}</td>
        <td style={tdStyle}>{customer.email}</td>
        

<td style={tdStyle}>
  <span
    style={{
      fontWeight: "bold",
      color:
        customer.creditScore >= 750
          ? "#28a745"
          : customer.creditScore >= 650
          ? "#ffc107"
          : "#dc3545",
    }}
  >
    {customer.creditScore}
  </span>
</td>

        <td style={tdStyle}>
          <span
            style={{
              background: getStatusColor(customer.kycStatus),
              color: "white",
              padding: "5px 12px",
              borderRadius: "20px",
            }}
          >
            {customer.kycStatus}
          </span>
        </td>

        <td style={tdStyle}>
          <button
            onClick={() =>
              setSelectedCustomer(
                selectedCustomer?.id === customer.id
                  ? null
                  : customer
              )
            }
            style={{
              background: "#0070f3",
              color: "#fff",
              border: "none",
              padding: "8px 15px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
             {selectedCustomer?.id === customer.id? "Hide KYC": "View KYC"}
          </button>
        </td>
      </tr>

      {/* Expand Row */}
      {selectedCustomer?.id === customer.id && (
        <tr>
          <td
            colSpan="5"
            style={{
              padding: "20px",
              background: "#f9f9f9",
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3>KYC Details</h3>

              <p>
                <strong>Name:</strong> {customer.name}
              </p>

              <p>
                <strong>Email:</strong> {customer.email}
              </p>

              <p>
                <strong>Phone:</strong> {customer.phone}
              </p>

              <p>
                <strong>PAN:</strong> {customer.pan}
              </p>

              <p>
                <strong>Aadhaar:</strong> {customer.aadhaar}
              </p>
              <p>
                <strong>Credit Score:</strong>{" "}
                 <span
                   style={{
                     fontWeight: "bold",
                        color:
                       customer.creditScore >= 750
                             ? "#28a745"
                              : customer.creditScore >= 650
                               ? "#ffc107"
                               : "#dc3545",
    }}
  >
    {selectedCustomer.creditScore}
  </span>
</p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color: getStatusColor(customer.kycStatus),
                    fontWeight: "bold",
                  }}
                >
                  {customer.kycStatus}
                </span>
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "15px",
                }}
              >
                <button
                  onClick={() => fetchDiditDetails(customer.sessionId)}
                   style={{
                     background: "#0070f3",
                     color: "#fff",
                     border: "none",
                     padding: "10px 20px",
                     borderRadius: "5px",
                     cursor: "pointer",
                   }}
                 >
                 Fetch Didit Result
                </button>
                <button
                  onClick={() =>
                    updateKYCStatus(customer.id, "Verified")
                  }
                  style={{
                    background: "#28a745",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Approve
                </button>

                <button
                  onClick={() =>
                    updateKYCStatus(customer.id, "Rejected")
                  }
                  style={{
                    background: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Reject
                </button>

              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  ))}
</tbody>
      </table>

      {/* KYC Details Card */}
      {selectedCustomer && (
        <div
          style={{
            marginTop: "30px",
            background: "#fff",
            padding: "25px",
            borderRadius: "10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2>KYC Details</h2>

          <p>
            <strong>Name:</strong> {selectedCustomer.name}
          </p>

          <p>
            <strong>Email:</strong> {selectedCustomer.email}
          </p>

          <p>
            <strong>Phone:</strong> {selectedCustomer.phone}
          </p>

          <p>
            <strong>PAN:</strong> {selectedCustomer.pan}
          </p>

          <p>
            <strong>Aadhaar:</strong> {selectedCustomer.aadhaar}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color: getStatusColor(selectedCustomer.kycStatus),
                fontWeight: "bold",
              }}
            >
              {selectedCustomer.kycStatus}
            </span>
          </p>

          {/* Approve/Reject Buttons */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
            }}
          >
            <button
              onClick={() =>
                updateKYCStatus(selectedCustomer.id, "Verified")
              }
              style={{
                background: "#28a745",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Approve
            </button>

            <button
              onClick={() =>
                updateKYCStatus(selectedCustomer.id, "Rejected")
              }
              style={{
                background: "#dc3545",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};