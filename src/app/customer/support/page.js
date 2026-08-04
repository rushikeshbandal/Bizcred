"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomerSupport() {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  function getToken() {
    return localStorage.getItem("customerToken");
  }

  useEffect(() => {
    loadMyTickets();
  }, []);

  async function loadMyTickets() {
    const token = getToken();
    if (!token) {
      router.push("/customer/login");
      return;
    }
    try {
      const res = await fetch("/api/customer/support/my-tickets", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (data.success) setTickets(data.tickets);
    } catch (err) {
      console.error(err);
    }
    setLoadingTickets(false);
  }

  const submitTicket = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!subject.trim() || !message.trim()) {
      setError("Please fill in both subject and message.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/customer/support/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim(), priority }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("Your ticket has been submitted. Our team will get back to you soon.");
        setSubject("");
        setMessage("");
        setPriority("Medium");
        loadMyTickets();
      } else {
        setError(data.message || "Failed to submit ticket.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  const statusColor = (status) => {
    switch (status) {
      case "Resolved":
      case "Closed":
        return { bg: "#e9f8ef", text: "#0f7a3d" };
      case "In Progress":
      case "Assigned":
        return { bg: "#eef2ff", text: "#1d4ed8" };
      default:
        return { bg: "#fffaf0", text: "#b45309" };
    }
  };

  return (
    <div style={styles.page}>
      <button style={styles.backLink} onClick={() => router.push("/customer/dashboard")}>
        ← Back to Dashboard
      </button>

      <h1 style={styles.pageTitle}>Support</h1>

      {/* Raise a ticket */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Raise a New Ticket</h3>

        <form onSubmit={submitTicket}>
          <label style={styles.label}>Subject</label>
          <input
            style={styles.input}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your issue"
          />

          <label style={styles.label}>Priority</label>
          <select style={styles.input} value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <label style={styles.label}>Message</label>
          <textarea
            style={{ ...styles.input, minHeight: "110px", resize: "vertical" }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue in detail"
          />

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button
            type="submit"
            style={{ ...styles.button, ...(submitting ? styles.buttonDisabled : {}) }}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </div>

      {/* My tickets */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>My Tickets</h3>

        {loadingTickets ? (
          <p style={styles.mutedText}>Loading...</p>
        ) : tickets.length === 0 ? (
          <p style={styles.mutedText}>You haven't raised any tickets yet.</p>
        ) : (
          <div style={styles.ticketList}>
            {tickets.map((t) => {
              const colors = statusColor(t.status);
              return (
                <div key={t._id} style={styles.ticketRow}>
                  <div style={styles.ticketMain}>
                    <p style={styles.ticketSubject}>{t.subject}</p>
                    <p style={styles.ticketMessage}>{t.message}</p>
                    <p style={styles.ticketDate}>
                      {new Date(t.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span style={{ ...styles.statusPill, background: colors.bg, color: colors.text }}>
                    {t.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "640px", margin: "0 auto", padding: "20px 20px 60px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  backLink: { background: "none", border: "none", color: "#1d4ed8", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: "16px" },
  pageTitle: { fontSize: "22px", fontWeight: 700, color: "#111827", marginBottom: "20px" },
  card: {
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "24px",
    marginBottom: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
  },
  cardTitle: { fontSize: "15px", fontWeight: 700, color: "#111827", marginTop: 0, marginBottom: "16px" },
  label: { display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px", marginTop: "12px" },
  input: {
    width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #d9dee6",
    fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  },
  error: { color: "#b3261e", background: "#fceeed", border: "1px solid #f5d0cc", padding: "10px 12px", borderRadius: "8px", marginTop: "14px", fontSize: "13px" },
  success: { color: "#0f7a3d", background: "#e9f8ef", border: "1px solid #bdeccf", padding: "10px 12px", borderRadius: "8px", marginTop: "14px", fontSize: "13px" },
  button: {
    width: "100%", padding: "13px", background: "#1d4ed8", border: "none", borderRadius: "8px",
    color: "#fff", fontSize: "15px", cursor: "pointer", fontWeight: 600, marginTop: "16px",
  },
  buttonDisabled: { background: "#c3d0f0", cursor: "not-allowed" },
  mutedText: { color: "#9ca3af", fontSize: "13.5px" },
  ticketList: { display: "flex", flexDirection: "column", gap: "12px" },
  ticketRow: {
    display: "flex", justifyContent: "space-between", gap: "12px",
    border: "1px solid #f0f1f3", borderRadius: "10px", padding: "14px",
  },
  ticketMain: { flex: 1, minWidth: 0 },
  ticketSubject: { fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 4px" },
  ticketMessage: { fontSize: "13px", color: "#6b7280", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" },
  ticketDate: { fontSize: "11.5px", color: "#9ca3af", margin: 0 },
  statusPill: { fontSize: "11.5px", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", height: "fit-content", whiteSpace: "nowrap" },
};