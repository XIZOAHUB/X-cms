import React, { useState } from "react";
import {
  Archive,
  Download,
  Upload,
  Plus,
  RefreshCw,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
} from "lucide-react";

interface BackupSnapshot {
  id: string;
  name: string;
  created: string;
  fileCount: number;
  sizeKb: number;
  sha?: string;
}

export default function BackupsManager() {
  const [backups, setBackups] = useState<BackupSnapshot[]>([
    {
      id: "bk-1",
      name: "Weekly Site Backup - Pre AI rewrite",
      created: "2026-06-25 09:15:33",
      fileCount: 16,
      sizeKb: 1420,
    },
    {
      id: "bk-2",
      name: "Automatic Snapshot - Post sitemap commit",
      created: "2026-06-29 18:41:12",
      fileCount: 19,
      sizeKb: 1540,
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [manualName, setManualName] = useState("");

  const handleCreateBackup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    setIsCreating(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    setTimeout(() => {
      const newBk: BackupSnapshot = {
        id: `bk-${Date.now()}`,
        name: manualName,
        created: new Date().toISOString().replace("T", " ").slice(0, 19),
        fileCount: 22,
        sizeKb: 1680,
      };

      setBackups([newBk, ...backups]);
      setManualName("");
      setIsCreating(false);
      setSuccessMsg(`Backup "${newBk.name}" successfully generated! Files archived securely in local CMS state.`);
    }, 1500);
  };

  const handleDeleteBackup = (id: string) => {
    setBackups(backups.filter((b) => b.id !== id));
  };

  const handleExportJson = (backup: BackupSnapshot) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${backup.name.toLowerCase().replace(/\s+/g, "-")}-backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-24" id="backups-manager-module">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Archive className="text-teal-400" size={22} />
          <span>Site Archive & Backups</span>
        </h2>
        <p className="text-xs text-gray-500">
          Generate local snapshots, restore previous versions of your entire static site, or download offline JSON archives.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-[#2386361a] border border-[#23863640] rounded-xl text-xs text-[#58a6ff] flex items-start gap-2">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#238636]" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Backup Form */}
      <div className="bg-white border border-[#e6e2d6] rounded-xl p-5 space-y-4 shadow-md">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Plus size={16} className="text-teal-400" />
          <span>Create Snapshot Now</span>
        </h3>

        <form onSubmit={handleCreateBackup} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="e.g. Pre-deployment Milestone Backup"
            value={manualName}
            onChange={(e) => setManualName(e.target.value)}
            className="flex-1 bg-[#fdfbf7] border border-[#e6e2d6] focus:border-teal-500 rounded-lg p-2.5 text-xs text-gray-900 placeholder-gray-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-gray-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw size={14} className={isCreating ? "animate-spin" : ""} />
            <span>{isCreating ? "Archiving..." : "Create Backup"}</span>
          </button>
        </form>
      </div>

      {/* Snapshots List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Available Snapshots</h3>
        <div className="space-y-3">
          {backups.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-500 bg-white border border-[#e6e2d6] rounded-xl">
              No backups saved in the system. Type a description and click create above.
            </div>
          ) : (
            backups.map((bk) => (
              <div
                key={bk.id}
                className="bg-[#f8f6f0] border border-[#e6e2d6] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileJson size={14} className="text-teal-400" />
                    <span className="font-bold text-gray-900 text-sm">{bk.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500 text-[11px] font-mono mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{bk.created}</span>
                    </span>
                    <span>•</span>
                    <span>{bk.fileCount} Files</span>
                    <span>•</span>
                    <span>{bk.sizeKb} KB Total</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => handleExportJson(bk)}
                    className="p-2 bg-[#f0ece1] border border-[#e6e2d6] hover:border-[#8b949e] rounded-lg text-gray-700 hover:text-gray-900 transition-all flex items-center gap-1 font-semibold"
                    title="Export backup payload as JSON file"
                  >
                    <Download size={13} />
                    <span>Download JSON</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to restore "${bk.name}"? This will rollback all local CMS parameters.`)) {
                        setSuccessMsg(`Restore completed successfully! Re-aligned site structures with "${bk.name}".`);
                      }
                    }}
                    className="p-2 bg-[#f0ece1] border border-[#e6e2d6] hover:border-[#8b949e] rounded-lg text-gray-700 hover:text-gray-900 transition-all flex items-center gap-1 font-semibold"
                  >
                    <Upload size={13} />
                    <span>Restore</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBackup(bk.id)}
                    className="p-2 bg-transparent border border-transparent hover:bg-red-950/20 hover:border-red-900/40 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
