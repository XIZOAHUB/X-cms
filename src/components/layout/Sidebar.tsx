import React from "react";
import { LayoutDashboard, FileCode, Edit3, Image as ImageIcon, Settings, Globe, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  profile: any;
}

export default function Sidebar({ activeTab, setActiveTab, profile }: SidebarProps) {
  const { logout } = useAuthStore();
  
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "files", label: "File Manager", icon: FileCode },
    { id: "blog", label: "Blog CMS", icon: Edit3 },
    { id: "media", label: "Media Library", icon: ImageIcon },
    { id: "website", label: "Website Settings", icon: Settings },
    { id: "deploy", label: "Cloudflare Deploy", icon: Globe },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white hidden md:flex flex-col h-full shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span>AuroraCMS</span>
          <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono">PRO</span>
        </h1>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
                isActive ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={18} className={isActive ? "text-blue-400" : ""} />
              {item.label}
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-2">
          <img src={profile?.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border border-gray-700" />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate">{profile?.username}</p>
          </div>
          <button onClick={logout} className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
  // Available
