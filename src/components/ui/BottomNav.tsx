import { LayoutDashboard, FolderClosed, BookOpen, Image, MoreHorizontal, Settings, Globe, Sparkles, Terminal } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showMoreMenu: boolean;
  setShowMoreMenu: (show: boolean) => void;
}

export default function BottomNav({ activeTab, setActiveTab, showMoreMenu, setShowMoreMenu }: BottomNavProps) {
  const mainTabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "files", label: "Files", icon: FolderClosed },
    { id: "blog", label: "Blog", icon: BookOpen },
    { id: "media", label: "Media", icon: Image },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowMoreMenu(false);
  };

  return (
    <div className="relative">
      {/* Mobile Drawer Backdrop */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 bg-[#000000]/70 z-40 transition-opacity"
          onClick={() => setShowMoreMenu(false)}
        />
      )}

      {/* Slide-up More Menu */}
      <div
        className={`fixed bottom-16 left-0 right-0 bg-white border-t border-[#e6e2d6] rounded-t-3xl p-6 z-50 transform transition-transform duration-300 shadow-2xl ${
          showMoreMenu ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="w-12 h-1 bg-[#30363d] rounded-full mx-auto mb-5" />
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
          More CMS Utilities
        </h3>
        <div className="grid grid-cols-3 gap-3.5 max-h-[350px] overflow-y-auto p-1.5">
          <button
            onClick={() => handleTabClick("website")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === "website"
                ? "bg-blue-600/10 border-blue-500 text-blue-400"
                : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
            }`}
          >
            <Settings size={20} className="mb-1.5" />
            <span className="text-[10px] font-semibold text-center truncate w-full">Settings</span>
          </button>

          <button
            onClick={() => handleTabClick("seo")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === "seo"
                ? "bg-blue-600/10 border-blue-500 text-blue-400"
                : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
            }`}
          >
            <Globe size={20} className="mb-1.5" />
            <span className="text-[10px] font-semibold text-center truncate w-full">SEO Suite</span>
          </button>

          <button
            onClick={() => handleTabClick("ai")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === "ai"
                ? "bg-purple-600/10 border-purple-500 text-purple-400"
                : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
            }`}
          >
            <Sparkles size={20} className="mb-1.5 text-purple-400" />
            <span className="text-[10px] font-semibold text-center truncate w-full">AI Studio</span>
          </button>

          <button
            onClick={() => handleTabClick("repos")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === "repos"
                ? "bg-blue-600/10 border-blue-500 text-blue-400"
                : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
            }`}
          >
            <MoreHorizontal size={20} className="mb-1.5 text-blue-400" />
            <span className="text-[10px] font-semibold text-center truncate w-full">Repos</span>
          </button>

          <button
            onClick={() => handleTabClick("terminal")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === "terminal"
                ? "bg-emerald-600/10 border-emerald-500 text-emerald-400"
                : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
            }`}
          >
            <Terminal size={20} className="mb-1.5 text-emerald-400" />
            <span className="text-[10px] font-semibold text-center truncate w-full">Terminal</span>
          </button>

          <button
            onClick={() => handleTabClick("automation")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === "automation"
                ? "bg-amber-600/10 border-amber-500 text-amber-400"
                : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
            }`}
          >
            <Settings size={20} className="mb-1.5 text-amber-400" />
            <span className="text-[10px] font-semibold text-center truncate w-full">Automation</span>
          </button>

          <button
            onClick={() => handleTabClick("analytics")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === "analytics"
                ? "bg-blue-600/10 border-blue-500 text-blue-400"
                : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
            }`}
          >
            <LayoutDashboard size={20} className="mb-1.5 text-emerald-400" />
            <span className="text-[10px] font-semibold text-center truncate w-full">Analytics</span>
          </button>

          <button
            onClick={() => handleTabClick("backups")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === "backups"
                ? "bg-teal-600/10 border-teal-500 text-teal-400"
                : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
            }`}
          >
            <FolderClosed size={20} className="mb-1.5 text-teal-400" />
            <span className="text-[10px] font-semibold text-center truncate w-full">Backups</span>
          </button>

          <button
            onClick={() => handleTabClick("git_activity")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === "git_activity"
                ? "bg-blue-600/10 border-blue-500 text-blue-400"
                : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
            }`}
          >
            <LayoutDashboard size={20} className="mb-1.5 text-purple-400" />
            <span className="text-[10px] font-semibold text-center truncate w-full">Git Timeline</span>
          </button>

          <button
            onClick={() => handleTabClick("logs")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === "logs"
                ? "bg-emerald-600/10 border-emerald-500 text-emerald-400"
                : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
            }`}
          >
            <FolderClosed size={20} className="mb-1.5 text-emerald-400" />
            <span className="text-[10px] font-semibold text-center truncate w-full">Logs</span>
          </button>

          <button
            onClick={() => handleTabClick("help")}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              activeTab === "help"
                ? "bg-blue-600/10 border-blue-500 text-blue-400"
                : "bg-[#fdfbf7] border-[#e6e2d6] hover:border-gray-600 text-gray-700"
            }`}
          >
            <Settings size={20} className="mb-1.5 text-blue-400" />
            <span className="text-[10px] font-semibold text-center truncate w-full">Help Hub</span>
          </button>
        </div>
      </div>

      {/* Main Sticky Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#e6e2d6] px-4 flex items-center justify-between z-45 shadow-xl">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative focus:outline-none transition-colors ${
                isActive ? "text-blue-400" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 relative focus:outline-none transition-colors ${
            showMoreMenu || ["website", "seo", "ai"].includes(activeTab)
              ? "text-blue-400"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <MoreHorizontal size={20} className="mb-1" />
          <span className="text-[10px] font-medium leading-none">More</span>
          {showMoreMenu && (
            <div className="absolute top-0 w-8 h-1 bg-blue-500 rounded-full" />
          )}
        </button>
      </nav>
    </div>
  );
}
