"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/admin-components/AdminShell";

export default function AdminKycPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/kyc-users", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to load customers.");
        setCustomers([]);
      } else {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load customers.");
    }
    setLoading(false);
  };

  const updateKycStatus = async (userId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/kyc-users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Failed to update status.");
      } else {
        setCustomers((prev) =>
          prev.map((c) => (c._id === userId ? { ...c, kyc: { ...c.kyc, status: newStatus } } : c))
        );
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
    setActionLoading(false);
  };

  const statusColor = (status) => {
    switch (status) {
      case "approved":
        return { bg: "#e9f8ef", text: "#0f7a3d" };
      case "rejected":
        return { bg: "#fceeed", text: "#b3261e" };
      case "pending":
        return { bg: "#fffaf0", text: "#b45309" };
      default:
        return { bg: "#f3f4f6", text: "#6b7280" };
    }
  };

  if (loading) {
    return (
      <AdminShell pageTitle="Customer KYC Management">
        <p style={styles.loadingText}>Loading customers...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell pageTitle="Customer KYC Management" pageSubtitle="Review Aadhaar and PAN verification results">
      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Aadhaar</th>
              <th style={styles.th}>PAN</th>
              <th style={styles.th}>KYC Status</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const kyc = customer.kyc || {};
              const colors = statusColor(kyc.status);
              const isExpanded = expandedId === customer._id;

              return (
                <>
                  <tr key={customer._id} style={styles.row}>
                    <td style={styles.td}>{customer.name}</td>
                    <td style={styles.td}>{customer.email}</td>
                    <td style={styles.td}>
                      <VerifyBadge verified={kyc.aadhaarVerified} />
                    </td>
                    <td style={styles.td}>
                      <VerifyBadge verified={kyc.panVerified} />
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusPill, background: colors.bg, color: colors.text }}>
                        {kyc.status || "not_submitted"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.viewButton}
                        onClick={() => setExpandedId(isExpanded ? null : customer._id)}
                      >
                        {isExpanded ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan="6" style={styles.expandCell}>
                        <div style={styles.expandCard}>
                          <div style={styles.detailGrid}>
                            <DetailBlock title="Account">
                              <DetailRow label="Name" value={customer.name} />
                              <DetailRow label="Email" value={customer.email} />
                              <DetailRow label="Mobile" value={customer.mobile} />
                              <DetailRow label="Account Status" value={customer.status} />
                            </DetailBlock>

                            <DetailBlock title="Aadhaar">
                              <DetailRow label="Verified" value={kyc.aadhaarVerified ? "Yes" : "No"} />
                              <DetailRow
                                label="Number"
                                value={kyc.aadhaar ? `XXXX XXXX ${kyc.aadhaar}` : "Not provided"}
                              />
                              <DetailRow label="Name on Aadhaar" value={kyc.aadhaarName} />
                              <DetailRow label="DOB" value={kyc.aadhaarDob} />
                              <DetailRow label="Gender" value={kyc.aadhaarGender} />
                              <DetailRow label="Address" value={kyc.aadhaarAddress} />
                            </DetailBlock>

                            <DetailBlock title="PAN">
                              <DetailRow label="Verified" value={kyc.panVerified ? "Yes" : "No"} />
                              <DetailRow label="Number" value={kyc.pan || "Not provided"} />
                              <DetailRow label="Category" value={kyc.panVerifiedCategory} />
                              <DetailRow label="Status" value={kyc.panVerifiedStatus} />
                              <DetailRow
                                label="Name Match"
                                value={kyc.panNameMatch === undefined ? "—" : kyc.panNameMatch ? "Yes" : "No"}
                              />
                              <DetailRow
                                label="DOB Match"
                                value={kyc.panDobMatch === undefined ? "—" : kyc.panDobMatch ? "Yes" : "No"}
                              />
                            </DetailBlock>
                          </div>

                          <div style={styles.actionRow}>
                            <button
                              style={{ ...styles.actionButton, background: "#0f7a3d" }}
                              onClick={() => updateKycStatus(customer._id, "approved")}
                              disabled={actionLoading || !kyc.aadhaarVerified || !kyc.panVerified}
                              title={
                                !kyc.aadhaarVerified || !kyc.panVerified
                                  ? "Both Aadhaar and PAN must be verified first"
                                  : ""
                              }
                            >
                              Approve
                            </button>
                            <button
                              style={{ ...styles.actionButton, background: "#b3261e" }}
                              onClick={() => updateKycStatus(customer._id, "rejected")}
                              disabled={actionLoading}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function VerifyBadge({ verified }) {
  return (
    <span
      style={{
        ...styles.verifyBadge,
        background: verified ? "#e9f8ef" : "#fceeed",
        color: verified ? "#0f7a3d" : "#b3261e",
      }}
    >
      {verified ? "Verified" : "Pending"}
    </span>
  );
}

function DetailBlock({ title, children }) {
  return (
    <div style={styles.detailBlock}>
      <h4 style={styles.detailBlockTitle}>{title}</h4>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value || "—"}</span>
    </div>
  );
}

const styles = {
  loadingText: { textAlign: "center", color: "#6b7280", padding: "60px 0" },
  errorBox: { background: "#fceeed", border: "1px solid #f5d0cc", color: "#b3261e", padding: "14px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" },
  tableWrap: { background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  theadRow: { background: "#f9fafb" },
  th: { padding: "14px 16px", textAlign: "left", fontSize: "12.5px", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #e5e7eb" },
  row: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#111827" },
  verifyBadge: { fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px" },
  statusPill: { fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", textTransform: "capitalize" },
  viewButton: { background: "#1d4ed8", color: "#fff", border: "none", padding: "7px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  expandCell: { padding: "16px", background: "#f9fafb" },
  expandCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "18px" },
  detailBlock: { minWidth: 0 },
  detailBlockTitle: { fontSize: "13px", fontWeight: 700, color: "#111827", marginBottom: "10px" },
  detailRow: { display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "13px", padding: "6px 0", borderBottom: "1px solid #f3f4f6" },
  detailLabel: { color: "#6b7280", flexShrink: 0 },
  detailValue: { color: "#111827", fontWeight: 500, textAlign: "right" },
  actionRow: { display: "flex", gap: "10px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" },
  actionButton: { color: "#fff", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "13.5px" },
};