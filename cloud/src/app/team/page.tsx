"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { fmtDuration, todayISO } from "@/lib/format";

type Row = {
  id: string; name: string; team: string | null;
  activeMs: number; idleMs: number; linkedinMs: number; naukriMs: number;
  linkedinConnections: number; linkedinMessages: number; linkedinProfilesViewed: number;
  naukriProfilesViewed: number; naukriDownloads: number;
};

export default function TeamPage() {
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/team?date=${date}`).then(async (r) => {
      if (!r.ok) { setErr("Admin access required"); return; }
      setRows(await r.json());
    });
  }, [date]);

  const totals = rows.reduce((a, r) => ({
    active: a.active + r.activeMs, linkedin: a.linkedin + r.linkedinMs, naukri: a.naukri + r.naukriMs,
    connections: a.connections + r.linkedinConnections, messages: a.messages + r.linkedinMessages,
    liProfiles: a.liProfiles + r.linkedinProfilesViewed, nkProfiles: a.nkProfiles + r.naukriProfilesViewed,
    cv: a.cv + r.naukriDownloads,
  }), { active: 0, linkedin: 0, naukri: 0, connections: 0, messages: 0, liProfiles: 0, nkProfiles: 0, cv: 0 });

  return (
    <Shell>
      <div className="topbar">
        <h1>Team</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      {err && <div className="empty">{err}</div>}
      {!err && (
        <>
          <div className="kpi-grid">
            <div className="kpi"><div className="kpi-label">Team active</div><div className="kpi-value">{fmtDuration(totals.active)}</div></div>
            <div className="kpi kpi-green"><div className="kpi-label">Team LinkedIn</div><div className="kpi-value">{fmtDuration(totals.linkedin)}</div></div>
            <div className="kpi kpi-blue"><div className="kpi-label">Team Naukri</div><div className="kpi-value">{fmtDuration(totals.naukri)}</div></div>
            <div className="kpi"><div className="kpi-label">Connections</div><div className="kpi-value">{totals.connections}</div></div>
          </div>
          <div className="card">
            <h2>Per-recruiter ({rows.length})</h2>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Recruiter</th><th>Team</th>
                  <th style={{ textAlign: "right" }}>Active</th>
                  <th style={{ textAlign: "right" }}>Idle</th>
                  <th style={{ textAlign: "right" }}>LinkedIn</th>
                  <th style={{ textAlign: "right" }}>Naukri</th>
                  <th style={{ textAlign: "right" }}>Conn</th>
                  <th style={{ textAlign: "right" }}>Msg</th>
                  <th style={{ textAlign: "right" }}>LI prof</th>
                  <th style={{ textAlign: "right" }}>NK prof</th>
                  <th style={{ textAlign: "right" }}>CVs</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={11} className="empty">No recruiters yet — add users via <code className="k">POST /api/users</code></td></tr>}
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td style={{ color: "var(--muted)" }}>{r.team || "—"}</td>
                    <td className="num">{fmtDuration(r.activeMs)}</td>
                    <td className="num">{fmtDuration(r.idleMs)}</td>
                    <td className="num">{fmtDuration(r.linkedinMs)}</td>
                    <td className="num">{fmtDuration(r.naukriMs)}</td>
                    <td className="num">{r.linkedinConnections}</td>
                    <td className="num">{r.linkedinMessages}</td>
                    <td className="num">{r.linkedinProfilesViewed}</td>
                    <td className="num">{r.naukriProfilesViewed}</td>
                    <td className="num">{r.naukriDownloads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Shell>
  );
}
