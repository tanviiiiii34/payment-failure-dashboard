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

/* ================= RESPONSIVE ================= */

const isMobile = window.innerWidth < 768;

/* ================= HELPERS ================= */

const formatReason = (r) =>
  r
    ? r.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "N/A";

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

  /* ================= FILTER ================= */

  const filtered = transactions.filter((t) => {
    const s = t.id.toLowerCase().includes(search.toLowerCase());
    const f = filter === "ALL" || t.failureReason === filter;
    return s && f;
  });

  const failed = filtered.filter((t) => t.status === "FAILED");
  const totalRetries = failed.reduce((s, t) => s + t.retryCount, 0);

  /* ================= CHART DATA ================= */

  const failureCounts = {};
  failed.forEach((t) => {
    failureCounts[t.failureReason] =
      (failureCounts[t.failureReason] || 0) + 1;
  });

  const barData = Object.entries(failureCounts).map(([k, v]) => ({
    reason: formatReason(k),
    count: v,
  }));

  const pieData = [
    { name: "Failures", value: failed.length },
    { name: "Retries", value: totalRetries },
  ];

  /* ================= CSV ================= */

  const exportCSV = () => {
    const csv = [
      ["ID", "Status", "Failure Reason", "Retries", "Severity"],
      ...filtered.map((t) => [
        t.id,
        t.status,
        formatReason(t.failureReason),
        t.retryCount,
        getSeverity(t.retryCount),
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "payment_failures.csv";
    a.click();
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
          <option value="ALL">All Failures</option>
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
      <div style={grid4}>
        <Stat title="Total Transactions" value={filtered.length} />
        <Stat title="Failed Transactions" value={failed.length} />
        <Stat title="Total Retries" value={totalRetries} />
        <Stat
          title="Avg Retries / Failure"
          value={failed.length ? (totalRetries / failed.length).toFixed(2) : "0.00"}
        />
      </div>

      {/* ================= CHARTS ================= */}
      <div style={grid2}>
        <Card title="Failure Distribution" dark={darkMode}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="reason" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Failures vs Retries" dark={darkMode}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={55}
                outerRadius={90}
                label
              >
                <Cell fill="#f97316" />
                <Cell fill="#6366f1" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ================= TABLE ================= */}
      <Card title="Transactions" dark={darkMode}>
        <div
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <table style={theme.table}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Status</th>
                <th style={th}>Failure Reason</th>
                <th style={th}>Retries</th>
                <th style={th}>Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const sev = getSeverity(t.retryCount);
                return (
                  <tr key={t.id}>
                    <td style={td}>{t.id}</td>
                    <td style={td}>{t.status}</td>
                    <td style={td}>{formatReason(t.failureReason)}</td>
                    <td style={td}>{t.retryCount}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "6px 12px",
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
      </Card>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

const Stat = ({ title, value }) => (
  <div style={card}>
    <p style={{ opacity: 0.6 }}>{title}</p>
    <h2>{value}</h2>
  </div>
);

const Card = ({ title, children, dark }) => (
  <div
    style={{
      ...card,
      background: dark ? "#1f2937" : "#ffffff",
      color: dark ? "#e5e7eb" : "#111827",
    }}
  >
    <h3 style={{ marginBottom: 16 }}>{title}</h3>
    {children}
  </div>
);

/* ================= LAYOUT ================= */

const controls = {
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  marginBottom: 24,
};

const grid4 = {
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const grid2 = {
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
  gap: 20,
  marginBottom: 24,
};

const card = {
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
};

/* ================= TABLE ================= */

const th = {
  textAlign: "left",
  padding: "12px 16px",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600,
};

const td = {
  padding: "12px 16px",
  borderBottom: "1px solid #f1f5f9",
};

/* ================= THEMES ================= */

const light = {
  page: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: isMobile ? 16 : 24,
    background: "#f4f6f8",
    color: "#111827",
  },
  input: {
    padding: 10,
    width: "100%",
    borderRadius: 8,
    border: "1px solid #d1d5db",
  },
  button: {
    padding: "10px",
    width: "100%",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
};

const dark = {
  ...light,
  page: {
    ...light.page,
    background: "#111827",
    color: "#e5e7eb",
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
};
