"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin-components/AdminShell";

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const res = await fetch("/api/admin/support", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });

    const data = await res.json();

    setTickets(data.tickets || []);
  };

  const updateStatus = async (id, status) => {
    await fetch(`/api/admin/support/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ status }),
    });

    loadTickets();
  };

  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.subject?.toLowerCase().includes(search.toLowerCase()) ||
      t.message?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "All" ? true : t.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "Open").length;
  const progressTickets = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedTickets = tickets.filter((t) => t.status === "Resolved").length;
  const criticalTickets = tickets.filter((t) => t.priority === "Critical").length;

  function getInitials(name) {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function priorityStyle(priority) {
    switch (priority) {
      case "Critical":
        return { bg: "#fceeed", text: "#b3261e" };
      case "High":
        return { bg: "#fff2e8", text: "#c2410c" };
      case "Medium":
        return { bg: "#eef2ff", text: "#1d4ed8" };
      default:
        return { bg: "#f3f4f6", text: "#6b7280" };
    }
  }

  function statusStyle(status) {
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
  }

  return (
    <AdminShell pageTitle="Support Management" pageSubtitle="Track and resolve customer support tickets">
      {/* KPI CARDS */}
      <div style={cardGrid}>
        <StatCard label="Total Tickets" value={totalTickets} gradient="linear-gradient(135deg,#667eea,#764ba2)" />
        <StatCard label="Open" value={openTickets} gradient="linear-gradient(135deg,#f7971e,#ffd200)" />
        <StatCard label="In Progress" value={progressTickets} gradient="linear-gradient(135deg,#8e2de2,#4a00e0)" />
        <StatCard label="Resolved" value={resolvedTickets} gradient="linear-gradient(135deg,#00c853,#64dd17)" />
        <StatCard label="Critical" value={criticalTickets} gradient="linear-gradient(135deg,#ff416c,#ff4b2b)" />
      </div>

      {/* FILTERS */}
      <div style={filterBox}>
        <input
          placeholder="Search by subject or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={input}
        />

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={select}>
          <option>All</option>
          <option>Open</option>
          <option>Assigned</option>
          <option>In Progress</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr style={theadRow}>
              <th style={th}>ID</th>
              <th style={th}>Subject</th>
              <th style={th}>Customer</th>
              <th style={th}>Priority</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
              <th style={th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="7" style={emptyCell}>
                  No tickets match your filters.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => {
                const pStyle = priorityStyle(ticket.priority);
                const sStyle = statusStyle(ticket.status);

                return (
                  <tr key={ticket._id} style={row}>
                    <td style={td}>
                      <span style={idBadge}>#{ticket._id.slice(-6)}</span>
                    </td>

                    <td style={td}>
                      <span style={subjectText}>{ticket.subject}</span>
                    </td>

                    <td style={td}>
                      <div style={customerCell}>
                        <div style={avatarStyle}>{getInitials(ticket.userName)}</div>
                        <div>
                          <div style={customerName}>{ticket.userName}</div>
                          <div style={customerEmail}>{ticket.userEmail}</div>
                        </div>
                      </div>
                    </td>

                    <td style={td}>
                      <span style={{ ...pill, background: pStyle.bg, color: pStyle.text }}>
                        {ticket.priority}
                      </span>
                    </td>

                    <td style={td}>
                      <span style={{ ...pill, background: sStyle.bg, color: sStyle.text }}>
                        {ticket.status}
                      </span>
                    </td>

                    <td style={td}>
                      <span style={dateText}>
                        {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    <td style={td}>
                      <select
                        value={ticket.status}
                        onChange={(e) => updateStatus(ticket._id, e.target.value)}
                        style={actionSelect}
                      >
                        <option>Open</option>
                        <option>Assigned</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Closed</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, gradient }) {
  return (
    <div style={{ ...cardBase, background: gradient }}>
      <p style={cardLabel}>{label}</p>
      <p style={cardValue}>{value}</p>
    </div>
  );
}

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
  gap: "16px",
  marginBottom: "26px",
};

const cardBase = {
  color: "#fff",
  padding: "18px 20px",
  borderRadius: "14px",
  boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
};

const cardLabel = { margin: "0 0 6px", fontSize: "12.5px", fontWeight: 500, opacity: 0.9 };
const cardValue = { margin: 0, fontSize: "26px", fontWeight: 700 };

const filterBox = {
  display: "flex",
  gap: "10px",
  marginBottom: "18px",
};

const input = {
  flex: 1,
  padding: "11px 14px",
  borderRadius: "8px",
  border: "1px solid #d9dee6",
  fontSize: "13.5px",
  outline: "none",
  background: "#fff",
};

const select = {
  padding: "11px 14px",
  borderRadius: "8px",
  border: "1px solid #d9dee6",
  fontSize: "13.5px",
  background: "#fff",
  outline: "none",
  cursor: "pointer",
};

const tableContainer = {
  background: "#fff",
  borderRadius: "14px",
  overflow: "hidden",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04)",
  border: "1px solid #e5e7eb",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const theadRow = { background: "#f9fafb" };

const th = {
  padding: "14px 18px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
  borderBottom: "1px solid #e5e7eb",
};

const row = { borderBottom: "1px solid #f3f4f6" };

const td = {
  padding: "16px 18px",
  fontSize: "13.5px",
  color: "#111827",
  verticalAlign: "middle",
};

const emptyCell = {
  padding: "40px",
  textAlign: "center",
  color: "#9ca3af",
  fontSize: "13.5px",
};

const idBadge = {
  fontFamily: "monospace",
  fontSize: "12.5px",
  color: "#6b7280",
  background: "#f3f4f6",
  padding: "3px 8px",
  borderRadius: "6px",
};

const subjectText = { fontWeight: 600, color: "#111827" };

const customerCell = { display: "flex", alignItems: "center", gap: "10px" };

const avatarStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  background: "linear-gradient(135deg,#1d4ed8,#4f7df9)",
  color: "#fff",
  fontSize: "12.5px",
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const customerName = { fontSize: "13.5px", fontWeight: 600, color: "#111827" };
const customerEmail = { fontSize: "12px", color: "#9ca3af" };

const pill = {
  fontSize: "11.5px",
  fontWeight: 700,
  padding: "4px 11px",
  borderRadius: "20px",
  whiteSpace: "nowrap",
};

const dateText = { fontSize: "13px", color: "#6b7280" };

const actionSelect = {
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid #d9dee6",
  fontSize: "12.5px",
  background: "#fff",
  outline: "none",
  cursor: "pointer",
};