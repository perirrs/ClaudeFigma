"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { todayISO } from "@/lib/format";

type Hour = { active: number; idle: number; linkedin: number; naukri: number };

export default function TimelinePage() {
  const [date, setDate] = useState(todayISO());
  const [hours, setHours] = useState<Hour[]>([]);
  useEffect(() => { fetch(`/api/analytics/timeline?date=${date}`).then((r) => r.json()).then(setHours); }, [date]);
  const max = Math.max(1, ...hours.map((h) => h.active + h.idle));

  return (
    <Shell>
      <div className="topbar">
        <h1>Timeline</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="card">
        <h2>Hourly breakdown</h2>
        <div className="tl">
          {hours.map((h, i) => {
            const scale = (v: number) => `${(v / max * 100).toFixed(1)}%`;
            return (
              <div key={i} className="col">
                <div className="seg li" style={{ height: scale(h.linkedin) }} />
                <div className="seg nk" style={{ height: scale(h.naukri) }} />
                <div className="seg other" style={{ height: scale(Math.max(0, h.active - h.linkedin - h.naukri)) }} />
                <div className="seg idle" style={{ height: scale(h.idle) }} />
                <div className="hr">{i}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 11, color: "var(--muted)", marginTop: 12 }}>
          <Legend color="var(--green)" label="LinkedIn" />
          <Legend color="var(--blue)" label="Naukri" />
          <Legend color="#475569" label="Other active" />
          <Legend color="#1b2530" label="Idle" />
        </div>
      </div>
    </Shell>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />{label}</span>;
}
