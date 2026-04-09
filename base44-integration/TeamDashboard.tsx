/**
 * Team Productivity Dashboard — React + Tailwind CSS component
 *
 * Drop this into your Base44 React app. It reads from the RecruiterActivity entity
 * and displays a consolidated team view.
 *
 * Usage in Base44:
 *   1. Create a new page in your Base44 app
 *   2. Import and render <TeamDashboard />
 *   3. Make sure RecruiterActivity entity exists with synced data
 *
 * Adjust the import path for your Base44 entity SDK as needed.
 */

import React, { useState, useEffect, useMemo } from "react";
// Adjust this import to match your Base44 entity path:
// import { RecruiterActivity } from "@/entities/RecruiterActivity";

// ---- Types ----
interface DayRecord {
  id?: string;
  recruiterName: string;
  recruiterEmail: string;
  date: string;
  activeMs: number;
  idleMs: number;
  linkedinMs: number;
  naukriMs: number;
  liProfilesCount: number;
  nkProfilesCount: number;
  liConnections: number;
  liMessages: number;
  liSearches: number;
  naukriDownloads: number;
  naukriContacts: number;
  naukriSearches: number;
  topDomains: { domain: string; ms: number }[];
  syncedAt: string;
}

// ---- Helpers ----
function fmt(ms: number): string {
  if (!ms || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// ---- Main Component ----
export default function TeamDashboard() {
  const [records, setRecords] = useState<DayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "week" | "month">("today");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Fetch all records from Base44 entity.
      // Adjust this call to match your Base44 SDK:
      const all = await RecruiterActivity.filter({});
      setRecords(all || []);
    } catch (e) {
      console.error("Failed to load recruiter data:", e);
    }
    setLoading(false);
  }

  const dates = useMemo(() => {
    if (period === "today") return [todayKey()];
    if (period === "week") return dateRange(7);
    return dateRange(30);
  }, [period]);

  // Group by recruiter and aggregate
  const recruiters = useMemo(() => {
    const dateSet = new Set(dates);
    const filtered = records.filter((r) => dateSet.has(r.date));
    const map = new Map<string, {
      name: string;
      email: string;
      activeMs: number;
      idleMs: number;
      linkedinMs: number;
      naukriMs: number;
      liProfiles: number;
      nkProfiles: number;
      liConnections: number;
      liMessages: number;
      naukriDownloads: number;
      naukriContacts: number;
      lastSync: string;
      days: number;
    }>();

    for (const r of filtered) {
      const key = r.recruiterEmail || r.recruiterName;
      const prev = map.get(key);
      if (!prev) {
        map.set(key, {
          name: r.recruiterName,
          email: r.recruiterEmail,
          activeMs: r.activeMs,
          idleMs: r.idleMs,
          linkedinMs: r.linkedinMs,
          naukriMs: r.naukriMs,
          liProfiles: r.liProfilesCount,
          nkProfiles: r.nkProfilesCount,
          liConnections: r.liConnections,
          liMessages: r.liMessages,
          naukriDownloads: r.naukriDownloads,
          naukriContacts: r.naukriContacts,
          lastSync: r.syncedAt,
          days: 1,
        });
      } else {
        prev.activeMs += r.activeMs;
        prev.idleMs += r.idleMs;
        prev.linkedinMs += r.linkedinMs;
        prev.naukriMs += r.naukriMs;
        prev.liProfiles += r.liProfilesCount;
        prev.nkProfiles += r.nkProfilesCount;
        prev.liConnections += r.liConnections;
        prev.liMessages += r.liMessages;
        prev.naukriDownloads += r.naukriDownloads;
        prev.naukriContacts += r.naukriContacts;
        if (r.syncedAt > prev.lastSync) prev.lastSync = r.syncedAt;
        prev.days++;
      }
    }
    return [...map.values()].sort((a, b) => b.activeMs - a.activeMs);
  }, [records, dates]);

  // Team totals
  const totals = useMemo(() => {
    return recruiters.reduce(
      (acc, r) => ({
        activeMs: acc.activeMs + r.activeMs,
        linkedinMs: acc.linkedinMs + r.linkedinMs,
        naukriMs: acc.naukriMs + r.naukriMs,
        liProfiles: acc.liProfiles + r.liProfiles,
        nkProfiles: acc.nkProfiles + r.nkProfiles,
        liConnections: acc.liConnections + r.liConnections,
        liMessages: acc.liMessages + r.liMessages,
        naukriDownloads: acc.naukriDownloads + r.naukriDownloads,
        naukriContacts: acc.naukriContacts + r.naukriContacts,
      }),
      { activeMs: 0, linkedinMs: 0, naukriMs: 0, liProfiles: 0, nkProfiles: 0, liConnections: 0, liMessages: 0, naukriDownloads: 0, naukriContacts: 0 }
    );
  }, [recruiters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 text-sm">Loading team data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Productivity</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {recruiters.length} recruiter{recruiters.length !== 1 ? "s" : ""} syncing
          </p>
        </div>
        <div className="flex gap-2">
          {(["today", "week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                period === p
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-emerald-300"
              }`}
            >
              {p === "today" ? "Today" : p === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
      </div>

      {/* Team KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Active Time" value={fmt(totals.activeMs)} color="emerald" />
        <KpiCard label="LinkedIn Time" value={fmt(totals.linkedinMs)} color="emerald" />
        <KpiCard label="Naukri Time" value={fmt(totals.naukriMs)} color="blue" />
        <KpiCard label="LI Connections" value={String(totals.liConnections)} color="emerald" />
      </div>

      {/* Team stats row */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        <StatCard label="LI Profiles" value={totals.liProfiles} />
        <StatCard label="Connections" value={totals.liConnections} />
        <StatCard label="Messages" value={totals.liMessages} />
        <StatCard label="NK Profiles" value={totals.nkProfiles} />
        <StatCard label="CVs Downloaded" value={totals.naukriDownloads} />
        <StatCard label="Contacts" value={totals.naukriContacts} />
      </div>

      {/* Recruiter table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Individual Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Recruiter</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Active</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">LinkedIn</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Naukri</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">LI Profiles</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Connections</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Messages</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">NK Profiles</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">CVs</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {recruiters.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-400">
                    No data yet. Recruiters need to enable sync in the extension settings.
                  </td>
                </tr>
              ) : (
                recruiters.map((r) => (
                  <tr key={r.email || r.name} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{r.name}</div>
                      <div className="text-xs text-gray-400">{r.email}</div>
                    </td>
                    <td className="text-right px-4 py-3 font-mono text-gray-700 dark:text-gray-300">{fmt(r.activeMs)}</td>
                    <td className="text-right px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400">{fmt(r.linkedinMs)}</td>
                    <td className="text-right px-4 py-3 font-mono text-blue-600 dark:text-blue-400">{fmt(r.naukriMs)}</td>
                    <td className="text-right px-4 py-3 font-mono">{r.liProfiles}</td>
                    <td className="text-right px-4 py-3 font-mono">{r.liConnections}</td>
                    <td className="text-right px-4 py-3 font-mono">{r.liMessages}</td>
                    <td className="text-right px-4 py-3 font-mono">{r.nkProfiles}</td>
                    <td className="text-right px-4 py-3 font-mono">{r.naukriDownloads}</td>
                    <td className="text-right px-4 py-3 text-xs text-gray-400">{formatSyncTime(r.lastSync)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components ----

function KpiCard({ label, value, color }: { label: string; value: string; color: "emerald" | "blue" }) {
  const colorClasses =
    color === "emerald"
      ? "border-emerald-200 dark:border-emerald-800/50"
      : "border-blue-200 dark:border-blue-800/50";
  const valueColor =
    color === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-blue-600 dark:text-blue-400";

  return (
    <div className={`bg-white dark:bg-gray-800 border ${colorClasses} rounded-xl p-4`}>
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-2xl font-bold tabular-nums ${valueColor}`}>{value}</div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center">
      <div className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">{value}</div>
      <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function formatSyncTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString();
}

// ---- Placeholder for Base44 entity (remove when using real SDK) ----
// @ts-ignore - Replace this with your actual Base44 entity import
const RecruiterActivity = {
  filter: async (_query: Record<string, unknown>): Promise<DayRecord[]> => {
    console.warn("Replace RecruiterActivity placeholder with real Base44 entity import");
    return [];
  },
};
