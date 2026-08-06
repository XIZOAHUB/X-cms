import React, { useState } from "react";
import {
  Zap,
  Play,
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  Server,
  CloudLightning,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface Webhook {
  id: string;
  name: string;
  url: string;
  event: string;
  active: boolean;
  lastTriggered?: string;
  status?: "success" | "failed";
}

export default function AutomationSuite() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: "wh-1",
      name: "Vercel Production Redeploy Trigger",
      url: "https://api.vercel.com/v1/integrations/deploy/prj_zS89h7d...",
      event: "On Commit File",
      active: true,
      lastTriggered: "2026-06-29 14:32:01",
      status: "success",
    },
    {
      id: "wh-2",
      name: "Netlify Production Webhook",
      url: "https://api.netlify.com/build_hooks/649e7b231da90...",
      event: "On Article Published",
      active: true,
      lastTriggered: "2026-06-30 09:12:45",
      status: "success",
    },
  ]);

  const [newWhName, setNewWhName] = useState("");
  const [newWhUrl, setNewWhUrl] = useState("");
  const [newWhEvent, setNewWhEvent] = useState("On Commit File");

  const [autoWebp, setAutoWebp] = useState(true);
  const [autoSitemap, setAutoSitemap] = useState(true);
  const [minifyHtml, setMinifyHtml] = useState(false);

  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhName.trim() || !newWhUrl.trim()) return;

    const newWh: Webhook = {
      id: `wh-${Date.now()}`,
      name: newWhName,
      url: newWhUrl,
      event: newWhEvent,
      active: true,
    };

    setWebhooks([...webhooks, newWh]);
    setNewWhName("");
    setNewWhUrl("");
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks(
      webhooks.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  const handleManualTrigger = (id: string) => {
    setTriggeringId(id);
    setTimeout(() => {
      setWebhooks(
        webhooks.map((w) =>
          w.id === id
            ? {
                ...w,
                lastTriggered: new Date().toISOString().replace("T", " ").slice(0, 19),
                status: "success",
              }
            : w
        )
      );
      setTriggeringId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-24" id="automation-suite-module">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="text-[#d29922]" size={22} />
          <span>Automation & Deployment Suite</span>
        </h2>
        <p className="text-xs text-gray-500">
          Connect external deployment servers, redeployment pipelines, configure build-time hooks, and auto-optimization triggers.
        </p>
      </div>

      {/* Auto-Optimization Preferences */}
      <div className="bg-white border border-[#e6e2d6] rounded-xl p-5 space-y-4 shadow-md">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-[#e6e2d6]/50">
          <Settings size={16} className="text-[#58a6ff]" />
          <span>Build-Time Auto Actions</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div>
              <p className="font-semibold text-gray-900">Auto WebP Image Conversion</p>
              <p className="text-[11px] text-gray-500">Convert newly uploaded JPG/PNG files to optimized WebP format automatically on commit.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoWebp}
                onChange={() => setAutoWebp(!autoWebp)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#30363d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f0f6fc] after:border-[#e6e2d6] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2f81f7]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm pt-3 border-t border-[#e6e2d6]/40">
            <div>
              <p className="font-semibold text-gray-900">Auto Sitemap XML Generation</p>
              <p className="text-[11px] text-gray-500">Automatically compile sitemap.xml on the fly when creating new markdown articles.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSitemap}
                onChange={() => setAutoSitemap(!autoSitemap)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#30363d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f0f6fc] after:border-[#e6e2d6] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2f81f7]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm pt-3 border-t border-[#e6e2d6]/40">
            <div>
              <p className="font-semibold text-gray-900">Minify Built-in HTML / CSS / JS</p>
              <p className="text-[11px] text-gray-500">Strip code whitespace, line breaks, and comments inside code editor on save.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={minifyHtml}
                onChange={() => setMinifyHtml(!minifyHtml)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#30363d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#f0f6fc] after:border-[#e6e2d6] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2f81f7]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Webhooks Manager */}
      <div className="bg-white border border-[#e6e2d6] rounded-xl p-5 space-y-4 shadow-md">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-[#e6e2d6]/50">
          <Server size={16} className="text-[#d29922]" />
          <span>External Deployment Webhooks</span>
        </h3>

        {/* Webhooks list */}
        <div className="space-y-3">
          {webhooks.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-500">
              No custom webhooks configured. Add one below to link Vercel, Netlify, or custom servers.
            </div>
          ) : (
            webhooks.map((wh) => (
              <div
                key={wh.id}
                className="p-4 bg-[#f8f6f0] border border-[#e6e2d6] rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CloudLightning size={14} className="text-[#2f81f7]" />
                    <span className="font-semibold text-gray-900 truncate">{wh.name}</span>
                    <span className="bg-[#30363d]/50 border border-[#e6e2d6] text-[9px] px-1.5 py-0.5 rounded font-mono text-gray-300">
                      {wh.event}
                    </span>
                  </div>
                  <p className="font-mono text-gray-500 truncate">{wh.url}</p>
                  {wh.lastTriggered && (
                    <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5">
                      {wh.status === "success" ? (
                        <CheckCircle2 size={11} className="text-[#238636]" />
                      ) : (
                        <AlertTriangle size={11} className="text-[#da3633]" />
                      )}
                      <span>
                        Last triggered: {wh.lastTriggered} • Status:{" "}
                        <span className={wh.status === "success" ? "text-[#238636] font-semibold" : "text-[#da3633]"}>
                          {wh.status === "success" ? "Success" : "Failed"}
                        </span>
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => handleManualTrigger(wh.id)}
                    disabled={triggeringId === wh.id || !wh.active}
                    className="p-1.5 bg-[#f0ece1] border border-[#e6e2d6] hover:border-[#8b949e] rounded-lg text-gray-900 hover:text-[#58a6ff] transition-all flex items-center gap-1 font-semibold disabled:opacity-50"
                  >
                    <Play size={12} className={triggeringId === wh.id ? "animate-pulse" : ""} />
                    <span>Ping</span>
                  </button>

                  <button
                    onClick={() => handleToggleWebhook(wh.id)}
                    className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      wh.active
                        ? "bg-[#2386361a] border-[#23863640] text-[#238636] hover:bg-[#23863630]"
                        : "bg-[#da36331a] border-[#da363340] text-[#da3633] hover:bg-[#da363330]"
                    }`}
                  >
                    {wh.active ? "Active" : "Paused"}
                  </button>

                  <button
                    onClick={() => handleDeleteWebhook(wh.id)}
                    className="p-1.5 bg-transparent border border-transparent hover:bg-red-950/20 hover:border-red-900/40 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Webhook Form */}
        <form onSubmit={handleAddWebhook} className="pt-4 border-t border-[#e6e2d6]/50 space-y-3">
          <span className="text-xs font-semibold text-gray-900">Add Automation Hook</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Hook Name</label>
              <input
                type="text"
                placeholder="e.g. My Server Sync"
                value={newWhName}
                onChange={(e) => setNewWhName(e.target.value)}
                className="w-full bg-[#fdfbf7] border border-[#e6e2d6] focus:border-blue-500 rounded-lg p-2 text-xs text-gray-900 placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Webhook URL</label>
              <input
                type="text"
                placeholder="https://api.example.com/deploy"
                value={newWhUrl}
                onChange={(e) => setNewWhUrl(e.target.value)}
                className="w-full bg-[#fdfbf7] border border-[#e6e2d6] focus:border-blue-500 rounded-lg p-2 text-xs text-gray-900 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Trigger Event</span>
              <select
                value={newWhEvent}
                onChange={(e) => setNewWhEvent(e.target.value)}
                className="bg-[#fdfbf7] border border-[#e6e2d6] text-xs text-gray-900 rounded-lg p-1.5 focus:outline-none focus:border-blue-500"
              >
                <option value="On Commit File">On Commit File</option>
                <option value="On Article Published">On Article Published</option>
                <option value="Manual Only">Manual Only</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-gray-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all self-end"
            >
              <Plus size={14} />
              <span>Register Webhook</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
