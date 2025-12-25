import { useState } from "react";
import transactions from "../data/transactions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

/* ================= HELPERS ================= */

const formatReason = (r) =>
  r ? r.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : "N/A";

const getSeverity = (r) => (r >= 3 ? "High" : r === 2 ? "Medium" : "Low");

const severityStyle = {
  High: { bg: "#fee2e2", text: "#991b1b" },
  Medium: { bg: "#fef3c7", text: "#92400e" },
  Low: { bg: "#d1fae5", text: "#065f46" },
};

/* ================= COMPONENT ================= */

export default function TransactionList() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [darkMode, setDarkMode] = useState(false);

  const theme = darkMode ? dark : light;

  /* ---------------- FILTER ---------------- */

  const filtered = transactions.filter((t) => {
    const matchSearch = t.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || t.failureReason === filter;
    return matchSearch && matchFilter;
  });

  /* ---------------- STATS ---------------- */

  const total = filtered.length;
  const failed = filtered.filter(t => t.status === "FAILED");
  const retries = failed.reduce((s, t) => s + t.retryCount, 0);
  const avg = failed.length ? (retries / failed.length).toFixed(2) : "0.00";

  /* ---------------- CHART DATA ---------------- */

  const failureCounts = {};
  failed.forEach(t => {
    failureCounts[t.failureReason] =
      (failureCounts[t.failureReason] || 0) + 1;
  });

  const barData = Object.entries(failureCounts).map(([k, v]) => ({
    reason: formatReason(k),
    count: v,
  }));

  const pieData = [
    { name: "Failures", value: failed.length },
    { name: "Retries", value: retries },
  ];

  /* ---------------- CSV EXPORT ---------------- */

  const exportCSV = () => {
    const header = ["ID", "Status", "Failure Reason", "Retries", "Severity"];

    const rows = filtered.map(t => [
      t.id,
      t.status,
      formatReason(t.failureReason),
      t.retryCount,
      getSeverity(t.retryCount),
    ]);

    const csv = [header, ...rows].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "payment_failure_report.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div style={theme.page}>
      {/* ================= CONTROLS ================= */}
      <div style={controls}>
        <input
          placeholder="Search Transaction ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={theme.input}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={theme.input}
        >
          <option value="ALL">All Failure Reasons</option>
          <option value="NETWORK_ERROR">Network Error</option>
          <option value="INVALID_CARD">Invalid Card</option>
          <option value="TIMEOUT">Timeout</option>
        </select>

        <button onClick={exportCSV} style={theme.button}>
          Export CSV
        </button>

        <button onClick={() => setDarkMode(!darkMode)} style={theme.button}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      {/* ================= STATS ================= */}
      <div style={statsGrid}>
        <Stat title="Total Transactions" value={total} theme={theme} />
        <Stat title="Failed Transactions" value={failed.length} theme={theme} />
        <Stat title="Total Retries" value={retries} theme={theme} />
        <Stat title="Avg Retries / Failure" value={avg} theme={theme} />
      </div>

      {/* ================= CHARTS ================= */}
      <div style={chartsGrid}>
        <div style={theme.card}>
          <h3>Failure Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="reason" stroke={theme.chartText} />
              <YAxis allowDecimals={false} stroke={theme.chartText} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={theme.card}>
          <h3>Failures vs Retries</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={90} label>
                <Cell fill="#f97316" />
                <Cell fill="#6366f1" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div style={theme.card}>
        <h3>Transactions</h3>

        <div style={{ overflowX: "auto" }}>
          <table style={theme.table}>
            <thead>
              <tr>
                <th style={theme.th}>ID</th>
                <th style={theme.th}>Status</th>
                <th style={theme.th}>Failure Reason</th>
                <th style={theme.th}>Retries</th>
                <th style={theme.th}>Severity</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(t => {
                const sev = getSeverity(t.retryCount);
                return (
                  <tr key={t.id}>
                    <td style={theme.td}>{t.id}</td>
                    <td style={theme.td}>{t.status}</td>
                    <td style={theme.td}>{formatReason(t.failureReason)}</td>
                    <td style={theme.td}>{t.retryCount}</td>
                    <td style={theme.td}>
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          background: severityStyle[sev].bg,
                          color: severityStyle[sev].text,
                        }}
                      >
                        {sev}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */

const Stat = ({ title, value, theme }) => (
  <div style={theme.card}>
    <p style={{ opacity: 0.7 }}>{title}</p>
    <h2>{value}</h2>
  </div>
);

/* ================= LAYOUT ================= */

const controls = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
  marginBottom: 28,
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
  marginBottom: 32,
};

const chartsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
  gap: 24,
  marginBottom: 32,
};

/* ================= THEMES ================= */

const light = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 24,
    background: "#f4f6f8",
    color: "#111827",
  },
  card: {
    background: "#ffffff",
    padding: 24,
    borderRadius: 16,
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },
  button: {
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "14px 12px",
    textAlign: "left",
    borderBottom: "2px solid #e5e7eb",
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #e5e7eb",
  },
  chartText: "#111827",
};

const dark = {
  ...light,
  page: {
    ...light.page,
    background: "#111827",
    color: "#e5e7eb",
  },
  card: {
    ...light.card,
    background: "#1f2937",
  },
  input: {
    ...light.input,
    background: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #374151",
  },
  button: {
    ...light.button,
    background: "#1f2937",
    color: "#e5e7eb",
    border: "1px solid #374151",
  },
  th: {
    ...light.th,
    borderBottom: "2px solid #374151",
  },
  td: {
    ...light.td,
    borderBottom: "1px solid #374151",
  },
  chartText: "#e5e7eb",
};
