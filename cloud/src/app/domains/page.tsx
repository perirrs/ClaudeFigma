"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { fmtDuration, todayISO } from "@/lib/format";

type Row = { domain: string; ms: number };

export default function DomainsPage() {
  const [date, setDate] = useState(todayISO());
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => { fetch(`/api/analytics/domains?date=${date}`).then((r) => r.json()).then(setRows); }, [date]);
  const max = Math.max(1, ...rows.map((r) => r.ms));

  return (
    <Shell>
      <div className="topbar">
        <h1>Apps &amp; Domains</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="card">
        <h2>Domains visited</h2>
        {rows.length === 0 && <div className="empty">No data yet</div>}
        <div className="list">
          {rows.map((r) => (
            <div key={r.domain} className="row">
              <div className="row-line"><span className="name">{r.domain}</span><span className="time">{fmtDuration(r.ms)}</span></div>
              <div className="bar"><span style={{ width: `${(r.ms / max * 100).toFixed(1)}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 12 }}>
        Time in non-browser applications (Outlook, Teams, Excel…) will be tracked once the Windows companion agent is added.
      </p>
    </Shell>
  );
}
