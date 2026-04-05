"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { fmtDuration, fmtTime, todayISO } from "@/lib/format";

type Profile = { url: string; name: string | null; title: string | null; views: number; ms: number; firstSeen: number; lastSeen: number };
type Data = { profiles: Profile[]; downloads: number; contacts: number; searches: number };

export default function NaukriPage() {
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch(`/api/analytics/naukri?date=${date}`).then((r) => r.json()).then(setData); }, [date]);

  return (
    <Shell>
      <div className="topbar">
        <h1>Naukri</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      {data && (
        <>
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="kpi kpi-blue"><div className="kpi-label">CV downloads</div><div className="kpi-value">{data.downloads}</div></div>
            <div className="kpi kpi-blue"><div className="kpi-label">Contacts viewed</div><div className="kpi-value">{data.contacts}</div></div>
            <div className="kpi"><div className="kpi-label">Searches</div><div className="kpi-value">{data.searches}</div></div>
          </div>
          <div className="card">
            <h2>Profiles viewed ({data.profiles.length})</h2>
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
