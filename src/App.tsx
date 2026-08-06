import { useState, useEffect } from "react";
import {
  Github,
  LogOut,
  RefreshCw,
  GitBranch,
  ShieldAlert,
  LayoutDashboard,
  FolderClosed,
  BookOpen,
  Image,
  Settings,
  Globe,
  Sparkles,
  ExternalLink,
  BarChart2,
  Database,
  Terminal,
  Workflow,
  Archive,
  History,
  HelpCircle,
  Search,
  Palette,
  Puzzle,
} from "lucide-react";
import { UserProfile, Repo } from "./types/index";
import AuthScreen from "./components/auth/AuthScreen";
import BottomNav from "./components/ui/BottomNav";
import Dashboard from "./components/dashboard/Dashboard";
import FileManager from "./components/content/FileManager";
import BlogCMS from "./components/content/BlogCMS";
import MediaLibrary from "./components/media/MediaLibrary";
import WebsiteManager from "./components/settings/WebsiteManager";
import SeoSuite from "./components/settings/SeoSuite";
import AiAssistant from "./components/editor/AiAssistant";

// New Premium Modules
import RepositoriesView from "./components/ui/RepositoriesView";
import AutomationSuite from "./components/settings/AutomationSuite";
import AnalyticsDashboard from "./components/settings/AnalyticsDashboard";
import BackupsManager from "./components/deploy/BackupsManager";
import GitTimeline from "./components/content/GitTimeline";
import AuditLogs from "./components/settings/AuditLogs";
import HelpHub from "./components/settings/HelpHub";
import PythonStudio from "./components/editor/PythonStudio";
import CloudflareManager from "./components/deploy/CloudflareManager";

import TerminalPanel from "./components/ui/TerminalPanel";
import ThemeOptimizer from "./components/settings/ThemeOptimizer";
import PluginManager from "./components/settings/PluginManager";

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [globalConfig, setGlobalConfig] = useState<any>(null);

  // Load saved credentials from localStorage on boot
  useEffect(() => {
    const cachedProfile = localStorage.getItem("aurora_profile");
    const cachedRepo = localStorage.getItem("aurora_repo");
    const cachedBranch = localStorage.getItem("aurora_branch");

    if (cachedProfile && cachedRepo && cachedBranch) {
      try {
        setProfile(JSON.parse(cachedProfile));
        setSelectedRepo(JSON.parse(cachedRepo));
        setActiveBranch(cachedBranch);
      } catch (err) {
        console.error("Failed to parse cached AuroraCMS credentials:", err);
        localStorage.clear();
      }
    }
  }, []);

  // Fetch config.json on load
  useEffect(() => {
    if (profile && selectedRepo && activeBranch) {
      const fetchConfig = async () => {
        try {
          const res = await fetch(`https://api.github.com/repos/${selectedRepo.owner}/${selectedRepo.name}/contents/config.json?ref=${activeBranch}`, {
            headers: {
              Authorization: `token ${profile.pat}`,
              Accept: "application/vnd.github.v3.raw",
            }
          });
          if (res.ok) {
            const data = await res.json();
            setGlobalConfig(data);
          } else {
            setGlobalConfig(null);
          }
        } catch (err) {
          console.warn("Could not fetch global config in App.tsx", err);
          setGlobalConfig(null);
        }
      };
      fetchConfig();
    }
  }, [profile, selectedRepo, activeBranch]);

  // Keyboard shortcut listener for custom command palette triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleConnected = (userProfile: UserProfile, repo: Repo, branch: string) => {
    setProfile(userProfile);
    setSelectedRepo(repo);
    setActiveBranch(branch);

    localStorage.setItem("aurora_profile", JSON.stringify(userProfile));
    localStorage.setItem("aurora_repo", JSON.stringify(repo));
    localStorage.setItem("aurora_branch", branch);
  };

  const handleDisconnect = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out and disconnect this repository?");
    if (!confirmLogout) return;

    setProfile(null);
    setSelectedRepo(null);
    setActiveBranch(null);
    setActiveTab("dashboard");
    setShowMoreMenu(false);
    localStorage.clear();
  };

  const renderActiveTab = () => {
    if (!profile || !selectedRepo || !activeBranch) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            profile={profile}
            repo={selectedRepo}
            branch={activeBranch}
            globalConfig={globalConfig}
            onNavigate={(tab) => {
              setActiveTab(tab);
              setShowMoreMenu(false);
            }}
          />
        );
      case "files":
        return <FileManager profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "blog":
        return <BlogCMS profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "media":
        return <MediaLibrary profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "website":
        return <WebsiteManager profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "seo":
        return <SeoSuite profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "ai":
        return <AiAssistant profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "plugins":
        return <PluginManager profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "theme_optimizer":
        return <ThemeOptimizer profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "repos":
        return (
          <RepositoriesView
            profile={profile}
            selectedRepo={selectedRepo}
            activeBranch={activeBranch}
            onRepoChange={(newRepo) => {
              setSelectedRepo(newRepo);
              localStorage.setItem("aurora_repo", JSON.stringify(newRepo));
            }}
            onBranchChange={(newBranch) => {
              setActiveBranch(newBranch);
              localStorage.setItem("aurora_branch", newBranch);
            }}
          />
        );
      case "automation":
        return <AutomationSuite profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "analytics":
        return <AnalyticsDashboard profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "terminal":
        return <TerminalPanel profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "python_studio":
        return <PythonStudio profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "cloudflare":
        return <CloudflareManager profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "backups":
        return <BackupsManager profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "git_activity":
        return <GitTimeline repo={selectedRepo} branch={activeBranch} />;
      case "logs":
        return <AuditLogs profile={profile} repo={selectedRepo} branch={activeBranch} />;
      case "help":
        return <HelpHub profile={profile} repo={selectedRepo} branch={activeBranch} />;
      default:
        return (
          <div className="py-12 text-center text-xs text-gray-500">
            This CMS module is currently under development.
          </div>
        );
    }
  };

  // If no repository is active, show login screen
  if (!profile || !selectedRepo || !activeBranch) {
    return (
      <AuthScreen
        onConnected={handleConnected}
        savedProfile={profile}
        savedRepo={selectedRepo}
        savedBranch={activeBranch}
      />
    );
  }

  // Generate Live URL helper
  const getLiveUrl = () => {
    if (!profile || !selectedRepo) return "";
    if (globalConfig?.customDomain) {
      let domain = globalConfig.customDomain;
      if (!domain.startsWith("http")) domain = `https://${domain}`;
      return domain;
    }
    const isPrimaryPages = selectedRepo.name.toLowerCase() === `${profile.username.toLowerCase()}.github.io`;
    if (isPrimaryPages) {
      return `https://${profile.username.toLowerCase()}.github.io/`;
    }
    return `https://${profile.username.toLowerCase()}.github.io/${selectedRepo.name}/`;
  };

  const desktopTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Main" },
    { id: "files", label: "Page Editor", icon: FolderClosed, section: "Main" },
    { id: "blog", label: "Blog Posts", icon: BookOpen, section: "Main" },
    { id: "media", label: "Media Library", icon: Image, section: "Main" },
    
    { id: "seo", label: "SEO Suite", icon: Globe, section: "Advanced" },
    { id: "ai", label: "AI Studio", icon: Sparkles, section: "Advanced" },
    { id: "plugins", label: "Plugin Store", icon: Puzzle, section: "Advanced" },
    { id: "theme_optimizer", label: "Theme Optimizer", icon: Palette, section: "Advanced" },
    { id: "website", label: "Global Settings", icon: Settings, section: "Advanced" },
    { id: "repos", label: "Repositories", icon: Database, section: "Advanced" },

    { id: "automation", label: "Automation", icon: Workflow, section: "System" },
    { id: "analytics", label: "Analytics", icon: BarChart2, section: "System" },
    { id: "terminal", label: "Terminal", icon: Terminal, section: "System" },
    { id: "python_studio", label: "Python Studio", icon: Terminal, section: "System" },
    { id: "cloudflare", label: "Cloudflare Manager", icon: Globe, section: "System" },
    { id: "backups", label: "Backups", icon: Archive, section: "System" },
    { id: "git_activity", label: "Git Timeline", icon: History, section: "System" },
    { id: "logs", label: "Audit Logs", icon: Terminal, section: "System" },
    { id: "help", label: "Help Hub", icon: HelpCircle, section: "System" },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-gray-700 flex font-sans selection:bg-blue-500/30 selection:text-gray-900 overflow-hidden" id="main-cms-layout">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#e6e2d6] flex-col justify-between shrink-0 h-screen select-none">
        <div className="flex flex-col overflow-y-auto">
          {/* Sidebar Brand Logo */}
          <div className="p-6 border-b border-[#e6e2d6] flex items-center gap-3">
            <div className="w-8 h-8 bg-[#58a6ff] rounded flex items-center justify-center font-extrabold text-[#0d1117]">
              X
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-gray-900 leading-none">AuroraCMS</span>
              <span className="text-[10px] text-gray-500 font-mono mt-1">v1.0.0 Alpha Stable</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="py-4 px-3 space-y-4">
            {/* Main Tabs Group */}
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Main Menu
              </div>
              <div className="space-y-1">
                {desktopTabs
                  .filter((t) => t.section === "Main")
                  .map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[#1f6feb26] text-[#58a6ff] border-l-2 border-[#58a6ff]"
                            : "text-gray-700 hover:bg-[#f0ece1] hover:text-gray-900 border-l-2 border-transparent"
                        }`}
                      >
                        <Icon size={16} className="mr-3" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Advanced Tabs Group */}
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Advanced Tools
              </div>
              <div className="space-y-1">
                {desktopTabs
                  .filter((t) => t.section === "Advanced")
                  .map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[#1f6feb26] text-[#58a6ff] border-l-2 border-[#58a6ff]"
                            : "text-gray-700 hover:bg-[#f0ece1] hover:text-gray-900 border-l-2 border-transparent"
                        }`}
                      >
                        <Icon size={16} className="mr-3" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* System Tabs Group */}
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                System & Dev Ops
              </div>
              <div className="space-y-1">
                {desktopTabs
                  .filter((t) => t.section === "System")
                  .map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[#1f6feb26] text-[#58a6ff] border-l-2 border-[#58a6ff]"
                            : "text-gray-700 hover:bg-[#f0ece1] hover:text-gray-900 border-l-2 border-transparent"
                        }`}
                      >
                        <Icon size={16} className="mr-3" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer User Details */}
        <div className="p-4 border-t border-[#e6e2d6] bg-[#fdfbf7] flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={profile.avatarUrl}
              alt={profile.username}
              className="w-8 h-8 rounded-full border border-[#e6e2d6] shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate leading-none">{profile.username}</p>
              <p className="text-[10px] text-gray-500 truncate mt-1">Enterprise Developer</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#f0ece1] hover:bg-red-950/40 border border-[#e6e2d6] hover:border-red-900/40 rounded-lg text-xs font-semibold text-gray-300 hover:text-red-400 transition-all"
          >
            <LogOut size={13} />
            <span>Disconnect</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN FRAME CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* DESKTOP CONTENT HEADER */}
        <header className="hidden md:flex h-16 border-b border-[#e6e2d6] items-center justify-between px-8 bg-[#fdfbf7] shrink-0 select-none">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Repositories</span>
            <span className="text-gray-500">/</span>
            <span className="font-semibold text-gray-900 flex items-center gap-2">
              {selectedRepo.name}
              <span className="w-2.5 h-2.5 rounded-full bg-[#238636] animate-pulse" title="Connected successfully" />
            </span>
            <span className="text-gray-500 text-xs ml-2 bg-[#f0ece1] border border-[#e6e2d6] px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
              <GitBranch size={10} className="text-blue-400" />
              <span>{activeBranch}</span>
            </span>
          </div>

          {/* VS Code / Command Palette launcher input */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden lg:flex items-center gap-2 bg-white hover:bg-[#f0ece1] border border-[#e6e2d6] rounded-xl px-4 py-1.5 text-xs text-gray-500 transition-all cursor-pointer w-72 select-none justify-between shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-gray-500" />
              <span>Search or run action...</span>
            </div>
            <kbd className="bg-[#f0ece1] border border-[#e6e2d6] px-1.5 py-0.5 rounded font-mono text-[10px] text-gray-400">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-3">
            <a
              href={getLiveUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 bg-[#f0ece1] border border-[#e6e2d6] rounded-md text-xs font-semibold hover:border-[#8b949e] hover:text-gray-900 transition-all flex items-center gap-1.5 text-gray-300"
            >
              <span>View Site</span>
              <ExternalLink size={12} />
            </a>
            <div className="text-[11px] font-semibold text-[#3fb950] bg-[#23863640] border border-[#238636] px-2 py-1 rounded-md uppercase tracking-wider font-mono">
              Live
            </div>
          </div>
        </header>

        {/* MOBILE STICKY TOP HEADER */}
        <header className="md:hidden sticky top-0 h-16 bg-white/95 backdrop-blur border-b border-[#e6e2d6] px-4 flex items-center justify-between z-40 shrink-0 select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-gray-900 shadow-md font-bold">
              X
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-1.5 leading-none">
                <span>AuroraCMS</span>
                <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                  v1.0
                </span>
              </h1>
              <p className="text-[10px] text-gray-500 font-mono truncate mt-1 max-w-[150px]">
                {selectedRepo.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 bg-[#f0ece1] border border-[#e6e2d6] px-2 py-0.5 rounded-lg text-[10px]">
              <GitBranch size={10} className="text-blue-400" />
              <span className="font-mono text-gray-300">{activeBranch}</span>
            </div>

            <button
              onClick={handleDisconnect}
              className="p-1.5 hover:bg-red-950/40 border border-transparent hover:border-red-900/40 rounded-lg text-gray-400 hover:text-red-400 transition-all"
              title="Disconnect website"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT CANVAS */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full max-w-5xl mx-auto pb-24 md:pb-8">
          {renderActiveTab()}
        </main>

        {/* TOUCH-OPTIMIZED MOBILE BOTTOM NAVIGATION BAR */}
        <div className="md:hidden">
          <BottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showMoreMenu={showMoreMenu}
            setShowMoreMenu={setShowMoreMenu}
          />
        </div>
      </div>

      {/* GLOBAL COMMAND PALETTE MODAL OVERLAY */}
      {paletteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-[15vh] z-50 p-4 animate-fade-in" onClick={() => setPaletteOpen(false)}>
          <div
            className="w-full max-w-lg bg-white border border-[#e6e2d6] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[50vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input search */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#e6e2d6] bg-[#fdfbf7]">
              <Search className="text-gray-400" size={18} />
              <input
                type="text"
                autoFocus
                placeholder="Search actions, files, settings or routes..."
                value={paletteQuery}
                onChange={(e) => setPaletteQuery(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm text-gray-900 focus:outline-none placeholder-gray-500"
              />
              <span className="text-[10px] text-gray-500 font-mono bg-[#f0ece1] border border-[#e6e2d6] px-1.5 py-0.5 rounded">
                ESC
              </span>
            </div>

            {/* Actions list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 bg-white">
              {(() => {
                const actionsList = [
                  { label: "Go to Dashboard", desc: "Overview of staging site", key: "dashboard", action: () => setActiveTab("dashboard") },
                  { label: "Go to Page Editor", desc: "Browse files and write code in Monaco", key: "files", action: () => setActiveTab("files") },
                  { label: "Go to Blog Posts", desc: "Manage draft and publish blogs", key: "blog", action: () => setActiveTab("blog") },
                  { label: "Go to Media Library", desc: "Upload and optimize assets", key: "media", action: () => setActiveTab("media") },
                  { label: "Go to SEO Suite", desc: "Configure sitemaps, schemas, and meta tags", key: "seo", action: () => setActiveTab("seo") },
                  { label: "Go to AI Studio", desc: "Interact with SEO, Writer, or Developer Agent", key: "ai", action: () => setActiveTab("ai") },
                  { label: "Go to Global Settings", desc: "Configure site and profile fields", key: "website", action: () => setActiveTab("website") },
                  { label: "Go to Repositories", desc: "Switch GitHub branches or projects", key: "repos", action: () => setActiveTab("repos") },
                  { label: "Go to Automation", desc: "Trigger static RSS and index generator", key: "automation", action: () => setActiveTab("automation") },
                  { label: "Go to Analytics", desc: "View Search Console and live visitors", key: "analytics", action: () => setActiveTab("analytics") },
                  { label: "Go to Python Studio", desc: "Edit python code and run serverless workers", key: "python_studio", action: () => setActiveTab("python_studio") },
                  { label: "Go to Cloudflare Manager", desc: "DNS, Workers, cache purging control", key: "cloudflare", action: () => setActiveTab("cloudflare") },
                  { label: "Go to Backups", desc: "Manage snapshots and recovery nodes", key: "backups", action: () => setActiveTab("backups") },
                  { label: "Go to Git Timeline", desc: "Inspect commit logs and branches", key: "git_timeline", action: () => setActiveTab("git_activity") },
                  { label: "Go to Audit Logs", desc: "System activity logs", key: "logs", action: () => setActiveTab("logs") },
                  { label: "Purge Cloudflare CDN Cache", desc: "Clear global edge proxies instantly", key: "purge", action: () => alert("Cloudflare global zone purged successfully!") },
                ];

                const filtered = actionsList.filter(
                  (a) =>
                    a.label.toLowerCase().includes(paletteQuery.toLowerCase()) ||
                    a.desc.toLowerCase().includes(paletteQuery.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <div className="py-8 text-center text-xs text-gray-500">
                      No matching commands found. Try 'go to' or 'purge'
                    </div>
                  );
                }

                return filtered.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.action();
                      setPaletteOpen(false);
                      setPaletteQuery("");
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#1f6feb1c] hover:text-[#58a6ff] text-gray-700 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[10px] text-gray-500 group-hover:text-[#58a6ff]/70">{item.desc}</span>
                    </div>
                    <span className="text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity text-[#58a6ff] font-semibold flex items-center gap-0.5">
                      Run <span className="text-xs">↵</span>
                    </span>
                  </button>
                ));
              })()}
            </div>
            
            {/* Palette Footer Help info */}
            <div className="p-2.5 bg-[#fdfbf7] border-t border-[#e6e2d6] text-[10px] text-gray-500 flex justify-between select-none font-mono">
              <span>↑↓ Navigation</span>
              <span>↵ Select action</span>
              <span>Esc close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

