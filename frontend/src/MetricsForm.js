import { useState, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const DARK = {
  bg: "#0a0d14",
  panel: "#0f1320",
  panelHover: "#1a2035",
  border: "#1e2535",
  accent: "#00d4ff",
  accent2: "#7c3aed",
  green: "#00e676",
  amber: "#ffab00",
  red: "#ff3d71",
  text: "#e2e8f0",
  muted: "#4a5568",
  tableHead: "#0a0d14",
  inputBg: "#0a0d14",
  tooltipBg: "#1a2035",
  scrollTrack: "#0a0d14",
  scrollThumb: "#1e2535",
  gaugeTrack: "#1e2535",
};

const LIGHT = {
  bg: "#f0f4f8",
  panel: "#ffffff",
  panelHover: "#f7fafc",
  border: "#e2e8f0",
  accent: "#0284c7",
  accent2: "#7c3aed",
  green: "#16a34a",
  amber: "#d97706",
  red: "#dc2626",
  text: "#1a202c",
  muted: "#718096",
  tableHead: "#f7fafc",
  inputBg: "#f7fafc",
  tooltipBg: "#ffffff",
  scrollTrack: "#f0f4f8",
  scrollThumb: "#cbd5e0",
  gaugeTrack: "#e2e8f0",
};

const GaugeChart = ({ value, label, color, icon, T }) => {
  const clamped = Math.min(Math.max(parseFloat(value) || 0, 0), 100);
  // SVG canvas: 160x120, arc center at (80, 90)
  const cx = 80, cy = 90, r = 55;
  const circ = 2 * Math.PI * r;
  // 270° arc (from 135° to 405°), so 75% of circumference is filled track
  const trackLen = circ * 0.75;
  const fillLen = (clamped / 100) * trackLen;
  const c = clamped > 85 ? T.red : clamped > 65 ? T.amber : color;

  return (
    <div style={{
      background: T.panel, border: `1px solid ${T.border}`,
      borderRadius: 16, padding: "20px 16px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      position: "relative", overflow: "hidden",
      transition: "background 0.3s, border-color 0.3s",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 2, background: `linear-gradient(90deg, transparent, ${c}, transparent)`
      }} />

      <svg width={160} height={105} viewBox="0 0 160 105" style={{ overflow: "visible" }}>
        {/* Grey track: 270° arc starting at 135° */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={T.gaugeTrack} strokeWidth={10}
          strokeDasharray={`${trackLen} ${circ - trackLen}`}
          strokeDashoffset={circ * (1 - 0.625)}
          strokeLinecap="round"
        />
        {/* Colored fill arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={c} strokeWidth={10}
          strokeDasharray={`${fillLen} ${circ - fillLen}`}
          strokeDashoffset={circ * (1 - 0.625)}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease, stroke 0.5s ease" }}
        />
        {/* Percentage text — perfectly centered in arc */}
        <text
          x={cx} y={cy - 8}
          textAnchor="middle" dominantBaseline="middle"
          fill={c}
          style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace" }}
        >
          {clamped.toFixed(1)}%
        </text>
        {/* Icon */}
        <text
          x={cx} y={cy + 16}
          textAnchor="middle" dominantBaseline="middle"
          fill={T.muted}
          style={{ fontSize: 10, fontFamily: "sans-serif", letterSpacing: 1 }}
        >
          {icon}
        </text>
      </svg>

      <span style={{ color: T.muted, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
};

const StatCard = ({ label, value, sub, accent, T }) => (
  <div style={{
    background: T.panel, border: `1px solid ${T.border}`,
    borderRadius: 12, padding: "16px 20px",
    position: "relative", overflow: "hidden",
    transition: "background 0.3s, border-color 0.3s",
  }}>
    <div style={{
      position: "absolute", left: 0, top: 0, bottom: 0,
      width: 3, background: accent, borderRadius: "2px 0 0 2px"
    }} />
    <div style={{ color: T.muted, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
      {label}
    </div>
    <div style={{ color: T.text, fontSize: 18, fontWeight: 600, fontFamily: "monospace" }}>
      {value}
    </div>
    {sub && <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>{sub}</div>}
  </div>
);

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function MetricsForm() {
  const [dark, setDark] = useState(true);
  const T = dark ? DARK : LIGHT;

  const [serverInfo, setServerInfo] = useState({ host: "", port: 22, username: "", password: "", name: "" });
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const historyRef = useRef([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8080/api/metrics/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serverInfo),
      });
      if (!response.ok) throw new Error("Connection failed - check host, port, username & password");
      const data = await response.json();
      setMetrics(data);
      const point = {
        time: new Date().toLocaleTimeString(),
        cpu: parseFloat(data.cpuUsage),
        memory: parseFloat(data.memoryUsage),
        disk: parseFloat(data.diskUsage),
      };
      historyRef.current = [...historyRef.current.slice(-19), point];
      setHistory([...historyRef.current]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: T.inputBg,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    color: T.text,
    padding: "10px 14px",
    fontSize: 14,
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s, background 0.3s, color 0.3s",
    fontFamily: "monospace",
    boxSizing: "border-box",
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: T.tooltipBg, border: `1px solid ${T.border}`,
          borderRadius: 8, padding: "10px 14px", fontSize: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}>
          {label && <div style={{ color: T.muted, marginBottom: 6 }}>{label}</div>}
          {payload.map((p, i) => (
            <div key={i} style={{ color: p.color || T.accent }}>
              {p.name}: <strong>{p.value}{p.unit || ""}</strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const tabs = ["overview", "performance", "processes", "network"];

  const processChartData = metrics?.topProcesses?.slice(0, 8).map(p => ({
    name: p.command?.split("/").pop()?.slice(0, 14) || p.command,
    cpu: parseFloat(p.cpu) || 0,
    memory: parseFloat(p.memory) || 0,
  })) || [];

  const diskPieData = metrics ? [
    { name: "Used", value: parseFloat(metrics.diskUsage) },
    { name: "Free", value: 100 - parseFloat(metrics.diskUsage) },
  ] : [];

  const memPieData = metrics ? [
    { name: "Used", value: parseFloat(metrics.memoryUsage) },
    { name: "Free", value: 100 - parseFloat(metrics.memoryUsage) },
  ] : [];

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      transition: "background 0.3s, color 0.3s",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${T.border}`,
        background: T.panel,
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60,
        position: "sticky", top: 0, zIndex: 100,
        transition: "background 0.3s, border-color 0.3s",
        boxShadow: dark ? "none" : "0 1px 8px rgba(0,0,0,0.08)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>ServerPulse</div>
            <div style={{ color: T.muted, fontSize: 11, letterSpacing: 1 }}>METRICS DASHBOARD</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {metrics && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green, boxShadow: `0 0 8px ${T.green}` }} />
              <span style={{ color: T.green, fontSize: 12, fontFamily: "monospace" }}>
                {metrics.serverName} · {metrics.host}:{metrics.port}
              </span>
            </div>
          )}

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDark(d => !d)}
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              background: T.inputBg,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              padding: "6px 14px",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              color: T.text,
              fontSize: 13,
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            <span style={{ fontSize: 16 }}>{dark ? "☀️" : "🌙"}</span>
            <span style={{ color: T.muted, fontSize: 12 }}>{dark ? "Light" : "Dark"}</span>
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>

        {/* Connection Form */}
        <div style={{
          background: T.panel, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: 28, marginBottom: 32,
          transition: "background 0.3s, border-color 0.3s",
        }}>
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: T.accent, fontSize: 16 }}>🔌</span>
            <span style={{ fontWeight: 600, letterSpacing: 0.5 }}>Server Connection</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            {[
              { label: "Host / IP", name: "host", type: "text", placeholder: "192.168.1.1" },
              { label: "Port", name: "port", type: "number", placeholder: "22" },
              { label: "Username", name: "username", type: "text", placeholder: "root" },
              { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
              { label: "Server Name", name: "name", type: "text", placeholder: "prod-server-01" },
            ].map(field => (
              <div key={field.name}>
                <label style={{ display: "block", color: T.muted, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  value={serverInfo[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = T.accent}
                  onBlur={e => e.target.style.borderColor = T.border}
                  required
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: 20,
              padding: "11px 32px",
              background: loading ? T.border : `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
              border: "none", borderRadius: 8,
              color: "#fff", fontWeight: 600, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              letterSpacing: 0.5,
              display: "flex", alignItems: "center", gap: 8,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 14, height: 14,
                  border: `2px solid rgba(255,255,255,0.3)`,
                  borderTopColor: "#fff", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite", display: "inline-block"
                }} />
                Connecting...
              </>
            ) : "▶ Fetch Metrics"}
          </button>

          {error && (
            <div style={{
              marginTop: 14, padding: "10px 16px",
              background: dark ? "rgba(255,61,113,0.1)" : "rgba(220,38,38,0.08)",
              border: `1px solid ${dark ? "rgba(255,61,113,0.3)" : "rgba(220,38,38,0.3)"}`,
              borderRadius: 8, color: T.red, fontSize: 13,
            }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {metrics && (
          <>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${T.border}` }}>
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{
                  padding: "10px 20px",
                  background: "none", border: "none",
                  borderBottom: activeTab === tab ? `2px solid ${T.accent}` : "2px solid transparent",
                  color: activeTab === tab ? T.accent : T.muted,
                  cursor: "pointer", fontSize: 13, fontWeight: 600,
                  letterSpacing: 1, textTransform: "uppercase",
                  transition: "all 0.2s", marginBottom: -1,
                }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <GaugeChart value={metrics.cpuUsage} label="CPU Usage" color={T.accent} icon="CPU" T={T} />
                  <GaugeChart value={metrics.memoryUsage} label="Memory" color={T.accent2} icon="RAM" T={T} />
                  <GaugeChart value={metrics.diskUsage} label="Disk Usage" color={T.green} icon="DISK" T={T} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
                  <StatCard label="Uptime" value={metrics.uptime} accent={T.green} T={T} />
                  <StatCard label="Processes" value={metrics.processCount} accent={T.accent} T={T} />
                  <StatCard label="Logged In Users" value={metrics.loggedInUsers} accent={T.accent2} T={T} />
                  <StatCard label="Load Average" value={metrics.loadAverage?.join(" · ")} accent={T.amber} T={T} />
                  <StatCard label="OS" value={metrics.osInfo} accent={T.accent} T={T} />
                  <StatCard label="Swap" value={metrics.swapInfo} accent={T.accent2} T={T} />
                </div>
                <div style={{ color: T.muted, fontSize: 12, fontFamily: "monospace", textAlign: "right" }}>
                  Last updated: {metrics.timestamp}
                </div>
              </>
            )}

            {/* PERFORMANCE */}
            {activeTab === "performance" && (
              <>
                {history.length > 1 && (
                  <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20, transition: "background 0.3s" }}>
                    <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}> Historical Trend</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={history}>
                        <defs>
                          <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={T.accent} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="mem" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={T.accent2} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={T.accent2} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                        <XAxis dataKey="time" stroke={T.muted} tick={{ fontSize: 11, fill: T.muted }} />
                        <YAxis stroke={T.muted} tick={{ fontSize: 11, fill: T.muted }} domain={[0, 100]} unit="%" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, color: T.muted }} />
                        <Area type="monotone" dataKey="cpu" stroke={T.accent} fill="url(#cpu)" name="CPU" unit="%" />
                        <Area type="monotone" dataKey="memory" stroke={T.accent2} fill="url(#mem)" name="Memory" unit="%" />
                        <Area type="monotone" dataKey="disk" stroke={T.green} fill="none" strokeDasharray="4 4" name="Disk" unit="%" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {[
                    { title: " Memory Breakdown", data: memPieData, color: T.accent2 },
                    { title: " Disk Breakdown", data: diskPieData, color: T.green },
                  ].map(({ title, data, color }) => (
                    <div key={title} style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, transition: "background 0.3s" }}>
                      <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>{title}</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                            <Cell fill={color} />
                            <Cell fill={T.border} />
                          </Pie>
                          <Tooltip content={<CustomTooltip />} formatter={(v) => `${v.toFixed(1)}%`} />
                          <Legend wrapperStyle={{ fontSize: 12, color: T.muted }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* PROCESSES */}
            {activeTab === "processes" && (
              <>
                {processChartData.length > 0 && (
                  <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 20, transition: "background 0.3s" }}>
                    <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}> Top Processes — CPU & Memory</div>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={processChartData} layout="vertical" barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
                        <XAxis type="number" stroke={T.muted} tick={{ fontSize: 11, fill: T.muted }} unit="%" />
                        <YAxis type="category" dataKey="name" width={120} stroke={T.muted} tick={{ fontSize: 11, fill: T.muted }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 12, color: T.muted }} />
                        <Bar dataKey="cpu" fill={T.accent} name="CPU %" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="memory" fill={T.accent2} name="Mem %" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", transition: "background 0.3s" }}>
                  <div style={{ padding: "16px 24px", borderBottom: `1px solid ${T.border}`, fontWeight: 600, fontSize: 14 }}>
                    Process Table
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: T.tableHead }}>
                        {["PID", "Command", "CPU %", "Memory %"].map(h => (
                          <th key={h} style={{
                            padding: "10px 20px", textAlign: "left",
                            color: T.muted, fontSize: 11, letterSpacing: 1.5,
                            textTransform: "uppercase", fontWeight: 600,
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.topProcesses.map((proc, idx) => (
                        <tr key={idx}
                          style={{ borderTop: `1px solid ${T.border}`, transition: "background 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = T.panelHover}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        >
                          <td style={{ padding: "11px 20px", fontFamily: "monospace", color: T.accent, fontSize: 13 }}>{proc.pid}</td>
                          <td style={{ padding: "11px 20px", fontSize: 13, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: T.text }}>{proc.command}</td>
                          <td style={{ padding: "11px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 2, maxWidth: 80 }}>
                                <div style={{ height: "100%", width: `${Math.min(parseFloat(proc.cpu) * 2, 100)}%`, background: T.accent, borderRadius: 2 }} />
                              </div>
                              <span style={{ fontFamily: "monospace", fontSize: 13, minWidth: 40, color: T.text }}>{proc.cpu}%</span>
                            </div>
                          </td>
                          <td style={{ padding: "11px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 2, maxWidth: 80 }}>
                                <div style={{ height: "100%", width: `${Math.min(parseFloat(proc.memory) * 5, 100)}%`, background: T.accent2, borderRadius: 2 }} />
                              </div>
                              <span style={{ fontFamily: "monospace", fontSize: 13, minWidth: 40, color: T.text }}>{proc.memory}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* NETWORK */}
            {activeTab === "network" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, transition: "background 0.3s" }}>
                  <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 14 }}> Network I/O</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {[
                      { label: "Bytes Received (RX)", value: formatBytes(metrics.network?.bytesReceived), raw: metrics.network?.bytesReceived, color: T.green },
                      { label: "Bytes Sent (TX)", value: formatBytes(metrics.network?.bytesSent), raw: metrics.network?.bytesSent, color: T.accent },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ color: T.muted, fontSize: 12 }}>{item.label}</span>
                          <span style={{ color: item.color, fontFamily: "monospace", fontSize: 14, fontWeight: 600 }}>{item.value}</span>
                        </div>
                        <div style={{ height: 6, background: T.border, borderRadius: 3 }}>
                          <div style={{
                            height: "100%", borderRadius: 3,
                            width: `${Math.min((item.raw / Math.max(metrics.network?.bytesReceived, metrics.network?.bytesSent)) * 100, 100)}%`,
                            background: item.color,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, transition: "background 0.3s" }}>
                  <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 14 }}> Network Chart</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={[
                      { name: "RX", value: metrics.network?.bytesReceived || 0 },
                      { name: "TX", value: metrics.network?.bytesSent || 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                      <XAxis dataKey="name" stroke={T.muted} tick={{ fontSize: 12, fill: T.muted }} />
                      <YAxis stroke={T.muted} tick={{ fontSize: 11, fill: T.muted }} tickFormatter={v => formatBytes(v)} />
                      <Tooltip content={<CustomTooltip />} formatter={v => formatBytes(v)} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        <Cell fill={T.green} />
                        <Cell fill={T.accent} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 28, transition: "background 0.3s" }}>
                  <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 14 }}> System Details</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { k: "OS", v: metrics.osInfo },
                      { k: "Uptime", v: metrics.uptime },
                      { k: "Swap", v: metrics.swapInfo },
                      { k: "Load Avg", v: metrics.loadAverage?.join(" / ") },
                      { k: "Timestamp", v: metrics.timestamp },
                    ].map(item => (
                      <div key={item.k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 10, borderBottom: `1px solid ${T.border}` }}>
                        <span style={{ color: T.muted, fontSize: 12 }}>{item.k}</span>
                        <span style={{ color: T.text, fontSize: 12, fontFamily: "monospace", textAlign: "right", maxWidth: "60%" }}>{item.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${T.scrollTrack}; }
        ::-webkit-scrollbar-thumb { background: ${T.scrollThumb}; border-radius: 3px; }
        body { margin: 0; background: ${T.bg}; transition: background 0.3s; }
      `}</style>
    </div>
  );
}
