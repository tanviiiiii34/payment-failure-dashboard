import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      alert("Enter a valid email");
      return;
    }
    onLogin({ email, role });
  };

  return (
    <div style={page}>
      <form onSubmit={handleSubmit} style={card}>
        <h2 style={{ marginBottom: 16 }}>Internal Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={input}
        >
          <option value="Admin">Admin</option>
          <option value="Viewer">Viewer</option>
        </select>

        <button type="submit" style={button}>
          Login
        </button>
      </form>
    </div>
  );
}

/* ===== Styles ===== */

const page = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f6f8",
};

const card = {
  background: "#ffffff",
  padding: 32,
  borderRadius: 16,
  width: 360,
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: 16,
  borderRadius: 8,
  border: "1px solid #d1d5db",
};

const button = {
  width: "100%",
  padding: "12px",
  borderRadius: 8,
  border: "none",
  background: "#6366f1",
  color: "#fff",
  cursor: "pointer",
};
