export default function Navbar({ user, role, onLogout }) {
  return (
    <div style={navbar}>
      <h3 style={{ margin: 0 }}>Payment Failure Dashboard</h3>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span>{user}</span>
        <span style={badge}>{role}</span>
        <button onClick={onLogout} style={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

const navbar = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 60,
  background: "#ffffff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 24px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  zIndex: 1000,
};

const badge = {
  background: "#e0e7ff",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
};

const logout = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
};
