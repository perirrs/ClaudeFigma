"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "key">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!r.ok) { const j = await r.json().catch(() => ({})); setErr(j.error || "Login failed"); setLoading(false); return; }
      const me = await r.json();
      document.cookie = `pa_key=${encodeURIComponent(me.api_key)}; path=/; max-age=${60 * 60 * 24 * 365}`;
      router.push(me.role === "admin" ? "/team" : "/dashboard");
    } catch { setErr("Network error"); }
    setLoading(false);
  }

  async function submitKey(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null);
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
      <div className="tabs">
        <button className={mode === "password" ? "tab active" : "tab"} onClick={() => { setMode("password"); setErr(null); }}>Email &amp; Password</button>
        <button className={mode === "key" ? "tab active" : "tab"} onClick={() => { setMode("key"); setErr(null); }}>API Key</button>
      </div>

      {mode === "password" ? (
        <form onSubmit={submitPassword}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoFocus />
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
          <button disabled={loading || !email.trim() || !password}>{loading ? "Logging in…" : "Log in"}</button>
          {err && <div className="err">{err}</div>}
        </form>
      ) : (
        <form onSubmit={submitKey}>
          <label>API key</label>
          <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="paste key…" autoFocus />
          <button disabled={loading || !key.trim()}>{loading ? "Checking…" : "Continue"}</button>
          {err && <div className="err">{err}</div>}
        </form>
      )}
    </div>
  );
}
