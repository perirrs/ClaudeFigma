"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { fmtDuration, todayISO } from "@/lib/format";

type Summary = {
  date: string; activeMs: number; idleMs: number; linkedinMs: number; naukriMs: number; otherMs: number;
  linkedinConnections: number; linkedinMessages: number; linkedinProfilesViewed: number;
  naukriProfilesViewed: number; naukriDownloads: number; naukriContacts: number; naukriSearches: number; linkedinSearches: number;
};
type DomainRow = { domain: string; ms: number };

export default function DashboardPage() {
  const [date, setDate] = useState(todayISO());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [domains, setDomains] = useState<DomainRow[]>([]);

  useEffect(() => {
    fetch(`/api/analytics/summary?date=${date}`).then((r) => r.json()).then(setSummary);
    fetch(`/api/analytics/domains?date=${date}`).then((r) => r.json()).then(setDomains);
  }, [date]);

  return (
    <Shell>
      <div className="topbar">
        <h1>My Day</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {summary && (
        <>
          <div className="kpi-grid">
            <div className="kpi"><div className="kpi-label">Active time</div><div className="kpi-value">{fmtDuration(summary.activeMs)}</div></div>
            <div className="kpi"><div className="kpi-label">Idle time</div><div className="kpi-value">{fmtDuration(summary.idleMs)}</div></div>
            <div className="kpi kpi-green"><div className="kpi-label">LinkedIn</div><div className="kpi-value">{fmtDuration(summary.linkedinMs)}</div></div>
            <div className="kpi kpi-blue"><div className="kpi-label">Naukri</div><div className="kpi-value">{fmtDuration(summary.naukriMs)}</div></div>
          </div>

          <div className="kpi-grid kpi-grid-sm">
            <div className="kpi-sm"><div className="kpi-label">Connections</div><div className="kpi-value-sm">{summary.linkedinConnections}</div></div>
            <div className="kpi-sm"><div className="kpi-label">Messages</div><div className="kpi-value-sm">{summary.linkedinMessages}</div></div>
            <div className="kpi-sm"><div className="kpi-label">LI profiles</div><div className="kpi-value-sm">{summary.linkedinProfilesViewed}</div></div>
            <div className="kpi-sm"><div className="kpi-label">Naukri profiles</div><div className="kpi-value-sm">{summary.naukriProfilesViewed}</div></div>
            <div className="kpi-sm"><div className="kpi-label">CV downloads</div><div className="kpi-value-sm">{summary.naukriDownloads}</div></div>
          </div>

          <div className="split">
            <div className="card">
              <h2>Time split</h2>
              <SplitBars summary={summary} />
            </div>
            <div className="card">
              <h2>Top domains</h2>
              <DomainList rows={domains.slice(0, 8)} />
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}

function SplitBars({ summary }: { summary: Summary }) {
  const total = Math.max(1, summary.activeMs + summary.idleMs);
  const rows = [
    { name: "LinkedIn", ms: summary.linkedinMs, color: "var(--green)" },
    { name: "Naukri", ms: summary.naukriMs, color: "var(--blue)" },
    { name: "Other active", ms: summary.otherMs, color: "#475569" },
    { name: "Idle", ms: summary.idleMs, color: "#1b2530" },
  ];
  return (
    <>
      {rows.map((r) => {
        const pct = ((r.ms / total) * 100).toFixed(1);
        return (
          <div key={r.name} className="sb">
            <div className="sb-head"><span className="name">{r.name}</span><span className="val">{fmtDuration(r.ms)} · {pct}%</span></div>
            <div className="bar"><span style={{ width: `${pct}%`, background: r.color }} /></div>
          </div>
        );
      })}
    </>
  );
}

function DomainList({ rows }: { rows: DomainRow[] }) {
  if (!rows.length) return <div className="empty">No data yet</div>;
  const max = Math.max(...rows.map((r) => r.ms), 1);
  return (
    <div className="list">
      {rows.map((r) => {
        const pct = ((r.ms / max) * 100).toFixed(1);
        return (
          <div key={r.domain} className="row">
            <div className="row-line"><span className="name">{r.domain}</span><span className="time">{fmtDuration(r.ms)}</span></div>
            <div className="bar"><span style={{ width: `${pct}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}
