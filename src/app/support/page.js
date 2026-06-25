"use client";

import { useEffect, useState } from "react";

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const res = await fetch(
      "http://localhost:3000/api/support/list"
    );

    const data = await res.json();

    setTickets(data.tickets || []);
  };

  const updateStatus = async (id, status) => {
    await fetch(
      "http://localhost:3000/api/support/update",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: id,
          status,
        }),
      }
    );

    loadTickets();
  };

  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.subject
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      t.message
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "All"
        ? true
        : t.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const totalTickets = tickets.length;
  const openTickets = tickets.filter(
    (t) => t.status === "Open"
  ).length;

  const progressTickets = tickets.filter(
    (t) => t.status === "In Progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (t) => t.status === "Resolved"
  ).length;

  const criticalTickets = tickets.filter(
    (t) => t.priority === "Critical"
  ).length;

  return (
    <div style={container}>
      <h1 style={heading}>
        🎫 Support Management
      </h1>

      {/* KPI CARDS */}
      <div style={cardGrid}>
        <div style={cardBlue}>
          <h4>Total Tickets</h4>
          <h2>{totalTickets}</h2>
        </div>

        <div style={cardOrange}>
          <h4>Open</h4>
          <h2>{openTickets}</h2>
        </div>

        <div style={cardPurple}>
          <h4>In Progress</h4>
          <h2>{progressTickets}</h2>
        </div>

        <div style={cardGreen}>
          <h4>Resolved</h4>
          <h2>{resolvedTickets}</h2>
        </div>

        <div style={cardRed}>
          <h4>Critical</h4>
          <h2>{criticalTickets}</h2>
        </div>
      </div>

      {/* FILTERS */}
      <div style={filterBox}>
        <input
          placeholder="Search Ticket..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={input}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          style={select}
        >
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
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket._id}>
                <td>
                  {ticket._id.slice(-6)}
                </td>

                <td>{ticket.subject}</td>

                <td>
                  <span
                    style={{
                      color:
                        ticket.priority ===
                        "Critical"
                          ? "red"
                          : "#333",
                    }}
                  >
                    {ticket.priority}
                  </span>
                </td>

                <td>{ticket.status}</td>

                <td>
                  {new Date(
                    ticket.createdAt
                  ).toLocaleDateString()}
                </td>

                <td>
                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      updateStatus(
                        ticket._id,
                        e.target.value
                      )
                    }
                  >
                    <option>Open</option>
                    <option>Assigned</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option>Closed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const container = {
  padding: "25px",
  background: "#f5f7fb",
  minHeight: "100vh",
};

const heading = {
  marginBottom: "20px",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(200px,1fr))",
  gap: "15px",
  marginBottom: "25px",
};

const cardBase = {
  color: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow:
    "0 5px 15px rgba(0,0,0,0.1)",
};

const cardBlue = {
  ...cardBase,
  background:
    "linear-gradient(135deg,#667eea,#764ba2)",
};

const cardOrange = {
  ...cardBase,
  background:
    "linear-gradient(135deg,#f7971e,#ffd200)",
};

const cardPurple = {
  ...cardBase,
  background:
    "linear-gradient(135deg,#8e2de2,#4a00e0)",
};

const cardGreen = {
  ...cardBase,
  background:
    "linear-gradient(135deg,#00c853,#64dd17)",
};

const cardRed = {
  ...cardBase,
  background:
    "linear-gradient(135deg,#ff416c,#ff4b2b)",
};

const filterBox = {
  display: "flex",
  gap: "10px",
  marginBottom: "20px",
};

const input = {
  flex: 1,
  padding: "10px",
};

const select = {
  padding: "10px",
};

const tableContainer = {
  background: "#fff",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow:
    "0 5px 15px rgba(0,0,0,0.1)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};