import React, { useState } from "react";
import {
  Terminal,
  Play,
  FileCode,
  Sliders,
  Clock,
  Package,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Key,
} from "lucide-react";
import { UserProfile, Repo } from "../../types/index";

interface PythonStudioProps {
  profile: UserProfile;
  repo: Repo;
  branch: string;
}

interface PythonScript {
  name: string;
  description: string;
  content: string;
  scheduler?: string;
  lastRun?: string;
  status?: "success" | "failed" | "idle";
}

export default function PythonStudio({ profile, repo, branch }: PythonStudioProps) {
  const [scripts, setScripts] = useState<PythonScript[]>([
    {
      name: "generate_search_index.py",
      description: "Crawls build directory, indexes headers & text, generates search index database.v2.json",
      scheduler: "*/15 * * * * (Every 15 min)",
      lastRun: "5 minutes ago",
      status: "success",
      content: `import json
import os
from bs4 import BeautifulSoup

def generate_index():
    print("🚀 Crawling and indexing static site content...")
    index_db = []
    
    # Simulate scanning html pages in repo
    pages = ["index.html", "about.html", "blog/index.html", "blog/hello-world.html"]
    for page in pages:
        print(f"📄 Scraping metadata & headers from: {page}")
        # Parse elements
        entry = {
            "url": f"/{page}",
            "title": page.replace(".html", "").replace("-", " ").title(),
            "content": f"Full body content scraped from {page} with headers and paragraph tags.",
            "category": "Documentation" if "about" in page else "Blog"
        }
        index_db.append(entry)
        
    print("💾 Saving structural output to public/database.v2.json...")
    with open("public/database.v2.json", "w") as f:
        json.dump(index_db, f, indent=2)
    print("✨ Successfully generated site search index database!")

if __name__ == "__main__":
    generate_index()`,
    },
    {
      name: "webp_compressor.py",
      description: "Compresses heavy PNG/JPG assets, converts to high-fidelity WebP format with AI metadata",
      scheduler: "0 0 * * * (Daily Midnight)",
      lastRun: "10 hours ago",
      status: "success",
      content: `import os
from PIL import Image

def optimize_images():
    print("🖼️ Scanning /assets directory for PNG/JPEG images...")
    images = ["hero-banner.png", "author-profile.jpg", "blog-placeholder.png"]
    
    for img in images:
        size_before = 1450200 # ~1.4MB
        size_after = 142300   # ~140KB
        compression_ratio = ((size_before - size_after) / size_before) * 100
        
        print(f"⚡ Processing asset: {img}")
        print(f"   ↳ Compressed WebP generated: assets/optimized/{img.split('.')[0]}.webp")
        print(f"   ↳ Saved {compression_ratio:.1f}% bandwidth ({size_after/1024:.1f} KB)")
        
    print("✅ WebP optimization batch complete. Pushing to GitHub CDN.")

if __name__ == "__main__":
    optimize_images()`,
    },
    {
      name: "sitemap_generator.py",
      description: "Rebuilds XML sitemap with dynamic URLs and injects Article schema details",
      scheduler: "0 12 * * * (Daily Noon)",
      lastRun: "Yesterday",
      status: "success",
      content: `import datetime
import xml.etree.ElementTree as ET

def build_sitemap():
    print("🌐 Initiating dynamic sitemap xml generator...")
    urls = ["https://aurora-blog.io/", "https://aurora-blog.io/about", "https://aurora-blog.io/posts"]
    
    root = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for url in urls:
        url_tag = ET.SubElement(root, "url")
        loc = ET.SubElement(url_tag, "loc")
        loc.text = url
        lastmod = ET.SubElement(url_tag, "lastmod")
        lastmod.text = datetime.date.today().isoformat()
        
    print("📁 Writing structural sitemap.xml...")
    print("📡 Google Sitemap Ping complete!")

if __name__ == "__main__":
    build_sitemap()`,
    },
  ]);

  const [selectedScript, setSelectedScript] = useState<PythonScript>(scripts[0]);
  const [editorContent, setEditorContent] = useState(scripts[0].content);
  const [runLogs, setRunLogs] = useState<string[]>([
    "Python 3.11.4 Virtual Environment Initialized.",
    "Type 'python run' or select a preset code block on the left panel to execute...",
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Package manager state
  const [packages, setPackages] = useState([
    { name: "requests", version: "2.31.0", size: "142 KB" },
    { name: "beautifulsoup4", version: "4.12.2", size: "95 KB" },
    { name: "pillow", version: "10.0.1", size: "4.2 MB" },
    { name: "google-genai", version: "2.4.0", size: "120 KB" },
  ]);
  const [newPkgName, setNewPkgName] = useState("");
  const [pkgLoading, setPkgLoading] = useState(false);

  // Environment variables state
  const [envVars, setEnvVars] = useState([
    { key: "CLOUDFLARE_API_TOKEN", value: "••••••••••••••••••••••••••••••••" },
    { key: "GOOGLE_INDEXING_CREDENTIALS", value: "••••••••••••••••••••••••••••••••" },
  ]);
  const [newEnvKey, setNewEnvKey] = useState("");
  const [newEnvVal, setNewEnvVal] = useState("");

  const handleSelectScript = (script: PythonScript) => {
    setSelectedScript(script);
    setEditorContent(script.content);
  };

  const handleRunScript = () => {
    setIsRunning(true);
    setRunLogs([
      `[${new Date().toLocaleTimeString()}] 🧪 Executing virtual container: python ${selectedScript.name}...`,
      "📦 Loading virtual environment virtualenv-aurora-cms-311...",
    ]);

    const lines = editorContent.split("\n");
    let currentLine = 0;

    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        // Feed log simulation
        const line = lines[currentLine].trim();
        if (line.includes("print(") && !line.startsWith("#")) {
          const logMsg = line
            .replace(/print\(f?["']/g, "")
            .replace(/["']\)/g, "")
            .replace(/\{.*?\}/g, "optimized-value");
          setRunLogs((prev) => [...prev, `[STDOUT] ${logMsg}`]);
        }
        currentLine++;
      } else {
        clearInterval(interval);
        setRunLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ Script execution successfully finished with Exit Code: 0`,
          `🌐 Changes mapped to dynamic workspace virtual staging environment.`,
        ]);
        setIsRunning(false);
        // Update last run state
        setScripts((prev) =>
          prev.map((s) =>
            s.name === selectedScript.name
              ? { ...s, lastRun: "Just now", status: "success" }
              : s
          )
        );
      }
    }, 250);
  };

  const handleSaveScriptChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      setScripts((prev) =>
        prev.map((s) =>
          s.name === selectedScript.name ? { ...s, content: editorContent } : s
        )
      );
      setIsSaving(false);
      alert("Script content saved locally and scheduled on virtual worker!");
    }, 500);
  };

  const handleInstallPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName.trim()) return;
    setPkgLoading(true);
    setRunLogs((prev) => [
      ...prev,
      `[PIP INSTALL] Resolving package '${newPkgName}'...`,
      `[PIP INSTALL] Downloading files from PyPI metadata indices...`,
    ]);

    setTimeout(() => {
      setPackages((prev) => [
        ...prev,
        { name: newPkgName.toLowerCase(), version: "1.0.0", size: "230 KB" },
      ]);
      setRunLogs((prev) => [
        ...prev,
        `[PIP INSTALL] Successfully installed ${newPkgName.toLowerCase()}-1.0.0`,
      ]);
      setNewPkgName("");
      setPkgLoading(false);
    }, 1200);
  };

  const handleAddEnv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvKey.trim() || !newEnvVal.trim()) return;
    setEnvVars((prev) => [...prev, { key: newEnvKey.toUpperCase(), value: "••••••••••••••••" }]);
    setNewEnvKey("");
    setNewEnvVal("");
  };

  const handleRemoveEnv = (key: string) => {
    setEnvVars((prev) => prev.filter((item) => item.key !== key));
  };

  return (
    <div className="space-y-6 pb-24" id="python-studio-view">
      {/* Operating System Header Banner */}
      <div className="bg-gradient-to-br from-purple-900/30 via-[#161b22] to-[#161b22] border border-[#e6e2d6] rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <Terminal className="text-purple-400 animate-pulse" size={20} />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Python Worker Studio & Serverless Engine</h2>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          AuroraCMS's sandboxed environment executes Python automations for indexing, image conversion, schema injection, and index rebuilding. Edit script files or define recurring task cron jobs instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Explorer & Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Script Explorer */}
          <div className="bg-white border border-[#e6e2d6] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Automations (Scripts)</span>
              <button
                onClick={() => {
                  const sName = prompt("Enter new python file name (e.g., test.py):");
                  if (sName) {
                    const newScript: PythonScript = {
                      name: sName.endsWith(".py") ? sName : `${sName}.py`,
                      description: "Custom user automation task script",
                      content: "print('Hello from AuroraCMS Python Virtual Workspace!')",
                      scheduler: "Manual Trigger Only",
                      status: "idle",
                    };
                    setScripts([...scripts, newScript]);
                    setSelectedScript(newScript);
                    setEditorContent(newScript.content);
                  }
                }}
                className="p-1 hover:bg-[#30363d] rounded-md text-purple-400 hover:text-gray-900 transition-colors"
                title="Create Python file"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-1.5">
              {scripts.map((script) => (
                <button
                  key={script.name}
                  onClick={() => handleSelectScript(script)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                    selectedScript.name === script.name
                      ? "bg-purple-950/20 border-purple-500/50 text-gray-900"
                      : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
                  }`}
                >
                  <FileCode size={18} className="shrink-0 text-purple-400 mt-0.5" />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs truncate">{script.name}</span>
                      {script.status === "success" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 line-clamp-1 leading-normal">
                      {script.description}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-gray-500 pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={10} />
                        {script.scheduler?.split(" ")[0]}
                      </span>
                      <span>Run {script.lastRun}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Package Manager */}
          <div className="bg-white border border-[#e6e2d6] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-gray-900">
              <Package size={16} className="text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider">PIP Package Manager</span>
            </div>

            <form onSubmit={handleInstallPackage} className="flex gap-2">
              <input
                type="text"
                placeholder="E.g., pillow, requests, numpy"
                value={newPkgName}
                onChange={(e) => setNewPkgName(e.target.value)}
                className="flex-1 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl px-3 py-1.5 text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={pkgLoading}
                className="px-3 bg-blue-600 hover:bg-blue-500 text-gray-900 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 shrink-0"
              >
                {pkgLoading ? <RefreshCw size={12} className="animate-spin" /> : "Install"}
              </button>
            </form>

            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className="flex items-center justify-between p-2 bg-[#fdfbf7] rounded-lg border border-[#e6e2d6]/50 text-xs font-mono"
                >
                  <span className="text-blue-400 font-semibold">{pkg.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>{pkg.version}</span>
                    <span className="text-gray-500">({pkg.size})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Secrets */}
          <div className="bg-white border border-[#e6e2d6] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-gray-900">
              <Key size={16} className="text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Py Env Variables & Secrets</span>
            </div>

            <form onSubmit={handleAddEnv} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="KEY_NAME"
                  value={newEnvKey}
                  onChange={(e) => setNewEnvKey(e.target.value)}
                  className="bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl px-2.5 py-1.5 text-[10px] text-gray-900 font-mono uppercase focus:outline-none"
                />
                <input
                  type="password"
                  placeholder="Secret Value"
                  value={newEnvVal}
                  onChange={(e) => setNewEnvVal(e.target.value)}
                  className="bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl px-2.5 py-1.5 text-[10px] text-gray-900 font-mono focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-[#f0ece1] border border-[#e6e2d6] text-amber-400 hover:text-gray-900 hover:bg-[#30363d] rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all"
              >
                Add Script Secret
              </button>
            </form>

            <div className="space-y-1">
              {envVars.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-2 bg-[#fdfbf7] rounded-lg border border-[#e6e2d6]/50 text-[10px] font-mono"
                >
                  <span className="text-gray-300 truncate max-w-[140px]" title={item.key}>
                    {item.key}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{item.value}</span>
                    <button
                      onClick={() => handleRemoveEnv(item.key)}
                      className="text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Browser IDE Editor & Execution Output */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Editor Board */}
          <div className="bg-white border border-[#e6e2d6] rounded-2xl overflow-hidden flex flex-col shadow-lg">
            <div className="bg-[#f8f6f0] px-4 py-3 border-b border-[#e6e2d6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="text-purple-400" size={16} />
                <span className="text-xs font-mono text-gray-900 font-semibold">
                  {selectedScript.name} <span className="text-[10px] text-gray-500">(Python 3.11 Sandbox)</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveScriptChanges}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-[#f0ece1] border border-[#e6e2d6] hover:bg-[#30363d] text-gray-900 text-xs font-semibold rounded-lg transition-all"
                >
                  {isSaving ? "Saving..." : "Save Code"}
                </button>
                <button
                  onClick={handleRunScript}
                  disabled={isRunning}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-gray-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-md"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play size={12} fill="currentColor" />
                      Run Script
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="relative flex-1">
              {/* Row indexes mock */}
              <div className="absolute left-0 top-0 bottom-0 w-9 bg-white border-r border-[#e6e2d6]/50 text-right pr-2 text-gray-500 font-mono text-xs select-none pt-4 flex flex-col space-y-1">
                {editorContent.split("\n").map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="w-full h-80 pl-12 pr-4 py-4 bg-[#fdfbf7] text-gray-700 font-mono text-xs leading-relaxed focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Interactive Shell / Terminal */}
          <div className="bg-[#fdfbf7] border border-[#e6e2d6] rounded-2xl overflow-hidden flex flex-col shadow-inner">
            <div className="bg-white px-4 py-2 border-b border-[#e6e2d6] flex items-center justify-between text-xs font-mono text-gray-400">
              <span className="flex items-center gap-1.5">
                <Terminal size={14} className="text-purple-400" />
                DOCKER EXECUTION LOGGER
              </span>
              <button
                onClick={() => setRunLogs(["Terminal clear... Virtual env ready."])}
                className="text-[10px] text-gray-500 hover:text-gray-900"
              >
                Clear logs
              </button>
            </div>

            <div className="bg-[#fdfbf7] font-mono p-4 min-h-48 max-h-64 overflow-y-auto text-[11px] leading-relaxed text-gray-300 space-y-1">
              {runLogs.map((log, idx) => {
                let color = "text-gray-300";
                if (log.includes("[STDOUT]")) color = "text-gray-700";
                if (log.includes("✅") || log.includes("Successfully")) color = "text-emerald-400 font-semibold";
                if (log.includes("🚀") || log.includes("📦")) color = "text-purple-300 font-semibold";
                if (log.includes("⚡") || log.includes("↳")) color = "text-blue-400";
                if (log.includes("🧪")) color = "text-amber-400";

                return (
                  <div key={idx} className={`${color} whitespace-pre-wrap`}>
                    {log}
                  </div>
                );
              })}
              {isRunning && (
                <div className="flex items-center gap-1.5 text-purple-400 text-xs py-1">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Processing dynamic worker output stream...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
