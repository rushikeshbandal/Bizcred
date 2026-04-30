"use client";
import { useEffect, useState } from "react";

export default function KYCPage() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [pan, setPan] = useState("");
  const [aadhaar, setAadhaar] = useState("");

  useEffect(() => {
    fetch("/api/users/list", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    })
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  }, []);

  const handleSubmit = async () => {
    await fetch("/api/users/kyc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({ userId, pan, aadhaar }),
    });

    alert("KYC updated");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>KYC Update</h1>

      <select onChange={(e) => setUserId(e.target.value)}>
        <option>Select User</option>
        {users.map(u => (
          <option key={u._id} value={u._id}>{u.name}</option>
        ))}
      </select>

      <input placeholder="PAN" onChange={(e)=>setPan(e.target.value)} />
      <input placeholder="Aadhaar" onChange={(e)=>setAadhaar(e.target.value)} />

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}