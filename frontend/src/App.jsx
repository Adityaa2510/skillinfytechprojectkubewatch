import { useEffect, useState } from "react";

function Pill({ ok }) {
  return <span className={`pill ${ok ? "up" : "down"}`}>{ok ? "● Operational" : "● Unavailable"}</span>;
}
export default function App() {
  const [health, setHealth] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState("");
  async function refresh() {
    try {
      const [h, s] = await Promise.all([
        fetch("/api/health", { cache: "no-store" }),
        fetch("/api/api/status", { cache: "no-store" })
      ]);
      if (!h.ok || !s.ok) throw new Error("API response error");
      setHealth(await h.json()); setStatus(await s.json()); setError("");
    } catch {
      setHealth(null); setStatus(null);
      setError("Could not reach the backend. Check Kubernetes pods and services.");
    }
    setChecked(new Date().toLocaleTimeString());
  }
  useEffect(() => { refresh(); const timer = setInterval(refresh, 15000); return () => clearInterval(timer); }, []);
  return <main className="shell">
    <nav className="nav"><div className="logo">K</div><div><b>KubeWatch</b><small>KUBERNETES PLATFORM</small></div><span className="local">● LOCAL CLUSTER</span></nav>
    <section className="hero"><label>PLATFORM OVERVIEW / CLUSTER HEALTH</label><h1>Know what's running.<br/><span>See what needs attention.</span></h1><p>A lightweight service dashboard for exploring Kubernetes deployments, API health, and workload behavior.</p><button onClick={refresh}>↻ Refresh status</button><small className="auto">Auto-refreshes every 15 seconds</small></section>
    {error && <div className="alert">⚠ {error}</div>}
    <section className="stats">
      <article><label>BACKEND STATUS</label><div><Pill ok={!!health}/></div><small>GET /health</small></article>
      <article><label>API SERVICE</label><h2>{status ? "Reachable" : "—"}</h2><small>FastAPI · Uvicorn</small></article>
      <article><label>ACTIVE INSTANCE</label><h2 className="instance">{health?.instance || "Waiting…"}</h2><small>Reported by backend</small></article>
      <article><label>LAST CHECKED</label><h2>{checked || "—"}</h2><small>Browser local time</small></article>
    </section>
    <section className="grid">
      <article className="panel"><label>SERVICE DETAILS</label><h2>Backend API</h2>
        <div className="row"><span>Service name</span><b>kubewatch-backend</b></div>
        <div className="row"><span>Health endpoint</span><code>/api/health</code></div>
        <div className="row"><span>Status endpoint</span><code>/api/api/status</code></div>
        <div className="row"><span>Instance ID</span><b>{health?.instance || "Unavailable"}</b></div>
        <div className="row"><span>API response</span><b>{status?.status || "Waiting"}</b></div>
      </article>
      <article className="panel"><label>RUNTIME CHECKS</label><h2>Platform signals</h2>
        <div className="signal"><i>{health ? "✓" : "!"}</i><div><b>Health probe</b><small>{health ? "Backend endpoint responds" : "Waiting for backend"}</small></div></div>
        <div className="signal"><i>{status ? "✓" : "!"}</i><div><b>API status</b><small>{status ? "Status endpoint responds" : "Status not available"}</small></div></div>
        <div className="signal"><i>i</i><div><b>Kubernetes note</b><small>Use kubectl to inspect pods, deployments, and events.</small></div></div>
      </article>
    </section>
    <footer><b>◆ KubeWatch</b><span>Built for learning Kubernetes, CI/CD & observability</span><span>v1.0.0</span></footer>
  </main>;
}
