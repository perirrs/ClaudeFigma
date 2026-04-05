"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Me = { name: string; role: "user" | "admin" };

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.ok ? r.json() : null).then(setMe);
  }, []);

  const links = [
    { href: "/dashboard", label: "My Day" },
    { href: "/linkedin", label: "LinkedIn" },
    { href: "/naukri", label: "Naukri" },
    { href: "/domains", label: "Apps & Domains" },
    { href: "/timeline", label: "Timeline" },
  ];
  if (me?.role === "admin") links.push({ href: "/team", label: "Team" });

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <div className="brand-name">Productivity</div>
            <div className="brand-sub">Analyser</div>
          </div>
        </div>
        <nav>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-item ${pathname === l.href ? "active" : ""}`}>{l.label}</Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          {me ? <>Signed in as <strong style={{ color: "var(--text)" }}>{me.name}</strong>{me.role === "admin" ? " · admin" : ""}</> : "…"}
          <div style={{ marginTop: 8 }}>
            <a href="#" onClick={(e) => { e.preventDefault(); document.cookie = "pa_key=; path=/; max-age=0"; location.href = "/"; }}>Sign out</a>
          </div>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}
