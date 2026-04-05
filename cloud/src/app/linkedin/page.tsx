"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { fmtDuration, fmtTime, todayISO } from "@/lib/format";

type Profile = { url: string; name: string | null; title: string | null; views: number; ms: number; firstSeen: number; lastSeen: number };
type Conn = { url: string; name: string | null; title: string | null; category: string; sentAt: number };
type Group = { category: string; count: number; rows: Conn[] };
type Data = { profiles: Profile[]; connectionGroups: Group[]; connectionsSent: number; messagesSent: number; searches: number };

export default function LinkedInPage() {
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch(`/api/analytics/linkedin?date=${date}`).then((r) => r.json()).then(setData); }, [date]);

  return (
    <Shell>
      <div className="topbar">
        <h1>LinkedIn</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      {data && (
        <>
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="kpi kpi-green"><div className="kpi-label">Connections sent</div><div className="kpi-value">{data.connectionsSent}</div></div>
            <div className="kpi kpi-green"><div className="kpi-label">Messages sent</div><div className="kpi-value">{data.messagesSent}</div></div>
            <div className="kpi"><div className="kpi-label">Searches</div><div className="kpi-value">{data.searches}</div></div>
          </div>

          <div className="card">
            <h2>Connection requests sent ({data.connectionsSent})</h2>
            {data.connectionGroups.length === 0 && (
              <div className="empty" style={{ padding: "12px 0" }}>No connection requests yet today</div>
            )}
            {data.connectionGroups.map((g) => (
              <div key={g.category} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#4ade80" }}>{g.category}</span>
                  <span style={{ fontSize: 11, color: "#8b98a5" }}>{g.count} {g.count === 1 ? "request" : "requests"}</span>
                </div>
                <table className="tbl">
                  <thead><tr><th>Name</th><th>Title</th><th style={{ textAlign: "right" }}>Sent at</th></tr></thead>
                  <tbody>
                    {g.rows.map((c, i) => (
                      <tr key={c.url + i}>
                        <td>{c.url ? <a href={c.url} target="_blank" rel="noreferrer">{c.name || "(unknown)"}</a> : (c.name || "(unknown)")}</td>
                        <td>{c.title || "—"}</td>
                        <td className="num">{fmtTime(c.sentAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Profiles viewed ({data.profiles.length})</h2>
            <div style={{ fontSize: 11, color: "#8b98a5", marginBottom: 8 }}>Viewed but no connection request sent.</div>
            <table className="tbl">
              <thead><tr><th>Name</th><th>Title</th><th style={{ textAlign: "right" }}>First</th><th style={{ textAlign: "right" }}>Last</th><th style={{ textAlign: "right" }}>Views</th><th style={{ textAlign: "right" }}>Time</th></tr></thead>
              <tbody>
                {data.profiles.length === 0 && (<tr><td colSpan={6} className="empty">No profiles viewed yet</td></tr>)}
                {data.profiles.map((p) => (
                  <tr key={p.url}>
                    <td><a href={p.url} target="_blank" rel="noreferrer">{p.name || "(unknown)"}</a></td>
                    <td>{p.title || "—"}</td>
                    <td className="num">{fmtTime(p.firstSeen)}</td>
                    <td className="num">{fmtTime(p.lastSeen)}</td>
                    <td className="num">{p.views}</td>
                    <td className="num">{fmtDuration(p.ms)}</td>
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
