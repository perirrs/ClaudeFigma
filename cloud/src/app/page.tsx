"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const r = await fetch("/api/me", { headers: { "X-PA-Key": key.trim() } });
    setLoading(false);
    if (!r.ok) { setErr("Invalid key"); return; }
    document.cookie = `pa_key=${encodeURIComponent(key.trim())}; path=/; max-age=${60 * 60 * 24 * 365}`;
    const me = await r.json();
    router.push(me.role === "admin" ? "/team" : "/dashboard");
  }

  return (
    <div className="setup">
      <h1>Productivity Analyser</h1>
      <p>Paste your API key to open the dashboard. Admin: the key for the seed user is printed in the server console on first run (or set <code className="k">PA_ADMIN_KEY</code>).</p>
      <form onSubmit={submit}>
        <label>API key</label>
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="paste key…" autoFocus />
        <button disabled={loading || !key.trim()}>{loading ? "Checking…" : "Continue"}</button>
        {err && <div className="err">{err}</div>}
      </form>
    </div>
  );
}
