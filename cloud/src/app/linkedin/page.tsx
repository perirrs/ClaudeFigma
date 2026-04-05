"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { fmtDuration, todayISO } from "@/lib/format";

type Profile = { url: string; name: string | null; title: string | null; views: number; ms: number };
type Data = { profiles: Profile[]; connectionsSent: number; messagesSent: number; searches: number };

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
            <h2>Profiles viewed ({data.profiles.length})</h2>
            <table className="tbl">
              <thead><tr><th>Name</th><th>Title</th><th style={{ textAlign: "right" }}>Views</th><th style={{ textAlign: "right" }}>Time</th></tr></thead>
              <tbody>
                {data.profiles.length === 0 && (<tr><td colSpan={4} className="empty">No profiles viewed yet</td></tr>)}
                {data.profiles.map((p) => (
                  <tr key={p.url}>
                    <td><a href={p.url} target="_blank" rel="noreferrer">{p.name || "(unknown)"}</a></td>
                    <td>{p.title || "—"}</td>
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
