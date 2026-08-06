import React, { useState } from "react";
import {
  Terminal,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Trash2,
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  status: "success" | "warning" | "error";
  details: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "log-1",
      timestamp: "2026-07-01 05:41:20",
      user: "Priyanshu Maurya",
      action: "Sitemap Compiled",
      module: "SEO",
      status: "success",
      details: "Successfully generated sitemap.xml containing 4 static page endpoints.",
    },
    {
      id: "log-2",
      timestamp: "2026-07-01 05:32:45",
      user: "Priyanshu Maurya",
      action: "Alt text analysis",
      module: "Media",
      status: "success",
      details: "Gemini AI model processed image alt text suggestion for header_logo.webp.",
    },
    {
      id: "log-3",
      timestamp: "2026-06-30 18:12:01",
      user: "Priyanshu Maurya",
      action: "File Saved",
      module: "Page Editor",
      status: "success",
      details: "Modified index.html contents, successfully committed sha '7f9202b'.",
    },
    {
      id: "log-4",
      timestamp: "2026-06-29 11:23:44",
      user: "Priyanshu Maurya",
      action: "Profile Connected",
      module: "Auth",
      status: "success",
      details: "Successfully connected GitHub PAT, validated credentials for user 'priyanshumaurya758'.",
    },
    {
      id: "log-5",
      timestamp: "2026-06-28 15:45:10",
      user: "System Daemon",
      action: "Build Failure",
      module: "Vercel Build",
      status: "error",
      details: "Production build failed on Vercel side due to missing TS interface imports.",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filterModule, setFilterModule] = useState<string>("All");

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to purge all active CMS session logs?")) {
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase());
    const matchesModule = filterModule === "All" || log.module === filterModule;
    return matchesSearch && matchesModule;
  });

  const modulesList = ["All", ...Array.from(new Set(logs.map((l) => l.module)))];

  return (
    <div className="space-y-6 pb-24" id="audit-logs-module">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Terminal className="text-[#3fb950]" size={22} />
            <span>Audit Logs & Security</span>
          </h2>
          <p className="text-xs text-gray-500">
            Real-time tracking of workspace edits, AI prompts, API connections, and deployment events.
          </p>
        </div>

        <button
          onClick={handleClearLogs}
          disabled={logs.length === 0}
          className="px-3 py-1.5 bg-transparent hover:bg-red-950/20 text-xs font-semibold text-gray-400 hover:text-red-400 border border-transparent hover:border-red-900/40 rounded-lg flex items-center gap-1.5 transition-all self-end disabled:opacity-50"
        >
          <Trash2 size={13} />
          <span>Clear Logs</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search logs by action, message, or module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#e6e2d6] focus:border-blue-500 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500 hidden sm:inline" />
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="bg-white border border-[#e6e2d6] text-xs text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-medium"
          >
            {modulesList.map((m) => (
              <option key={m} value={m}>
                {m === "All" ? "All Modules" : m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white border border-[#e6e2d6] rounded-xl overflow-hidden shadow-md">
        <div className="divide-y divide-[#30363d]/50 font-mono text-[11px]">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500">
              No active security logs matches your criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col md:flex-row items-start gap-3 md:gap-6 hover:bg-[#f8f6f0]/55 transition-colors">
                <div className="flex items-center gap-2.5 shrink-0 min-w-[120px]">
                  <Clock size={12} className="text-gray-500" />
                  <span className="text-gray-500">{log.timestamp.slice(5)}</span>
                </div>

                <div className="shrink-0 min-w-[100px]">
                  <span className={`inline-block px-2 py-0.5 rounded-full border text-[9px] font-semibold tracking-wide uppercase ${
                    log.status === "success"
                      ? "bg-[#2386361a] border-[#23863640] text-[#238636]"
                      : log.status === "warning"
                      ? "bg-[#d299221a] border-[#d2992240] text-[#d29922]"
                      : "bg-[#da36331a] border-[#da363340] text-[#da3633]"
                  }`}>
                    {log.status}
                  </span>
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <p className="text-gray-900 font-semibold text-xs flex items-center gap-1.5">
                    <span>{log.action}</span>
                    <span className="text-gray-500 text-[10px] bg-[#30363d]/40 border border-[#e6e2d6] px-1.5 py-0.5 rounded">
                      {log.module}
                    </span>
                  </p>
                  <p className="text-gray-400 font-sans leading-relaxed">{log.details}</p>
                  <p className="text-[10px] text-gray-500 font-sans">Triggered by: {log.user}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
