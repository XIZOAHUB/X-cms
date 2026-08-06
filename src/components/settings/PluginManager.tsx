import React, { useState, useEffect } from "react";
import { Puzzle, CheckCircle, Plus, Search, Trash2, Shield, Zap, Globe, MessageSquare, Image as ImageIcon, Code, BarChart, HardDrive } from "lucide-react";
import { UserProfile, Repo } from "../../types/index";
import { fetchFileContent, commitFile } from "../../services/githubApi";

interface PluginManagerProps {
  profile: UserProfile;
  repo: Repo;
  branch: string;
}

interface PluginInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  version: string;
}

const PLUGINS: PluginInfo[] = [
  {
    id: "seo-master",
    name: "SEO Master Pro",
    description: "Automatically optimize your site's meta tags, generate sitemaps, and analyze keywords for better search engine rankings.",
    category: "Marketing",
    icon: <Globe className="text-blue-500" size={24} />,
    version: "2.4.1"
  },
  {
    id: "analytics-suite",
    name: "Google Analytics Suite",
    description: "Seamlessly integrate GA4 and track user behavior, page views, and conversion events out of the box.",
    category: "Analytics",
    icon: <BarChart className="text-orange-500" size={24} />,
    version: "1.0.5"
  },
  {
    id: "live-chat",
    name: "LiveChat Widget",
    description: "Add a floating chat widget to your website to communicate with your visitors in real-time.",
    category: "Communication",
    icon: <MessageSquare className="text-green-500" size={24} />,
    version: "3.2.0"
  },
  {
    id: "image-optimizer",
    name: "Image Optimizer",
    description: "Automatically compress and convert uploaded images to WebP format to speed up page load times.",
    category: "Performance",
    icon: <ImageIcon className="text-purple-500" size={24} />,
    version: "1.8.2"
  },
  {
    id: "security-shield",
    name: "Security Shield",
    description: "Add extra security headers, rate limiting, and basic bot protection to your project.",
    category: "Security",
    icon: <Shield className="text-red-500" size={24} />,
    version: "4.0.0"
  },
  {
    id: "caching-engine",
    name: "Super Cache Engine",
    description: "Implement advanced caching strategies to deliver static pages in milliseconds.",
    category: "Performance",
    icon: <Zap className="text-yellow-500" size={24} />,
    version: "1.1.9"
  },
  {
    id: "custom-code",
    name: "Custom Scripts Injector",
    description: "Easily inject custom CSS or JavaScript snippets into the <head> or <body> of your pages.",
    category: "Development",
    icon: <Code className="text-gray-700" size={24} />,
    version: "2.0.1"
  },
  {
    id: "db-backup",
    name: "Auto Backups",
    description: "Schedule automated backups of your repository and linked databases to external storage.",
    category: "System",
    icon: <HardDrive className="text-indigo-500" size={24} />,
    version: "1.5.0"
  }
];

export default function PluginManager({ profile, repo, branch }: PluginManagerProps) {
  const [installedPlugins, setInstalledPlugins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [configSha, setConfigSha] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState("");

  const CONFIG_PATH = "aurora-plugins.json";

  useEffect(() => {
    fetchInstalledPlugins();
  }, [repo.fullName, branch]);

  const fetchInstalledPlugins = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { content, sha } = await fetchFileContent(profile.pat, repo.owner, repo.name, CONFIG_PATH, branch);
      setConfigSha(sha);
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.installed)) {
        setInstalledPlugins(parsed.installed);
      }
    } catch (err: any) {
      // 404 means no plugins installed yet
      if (!err.message.includes("404")) {
        console.error("Failed to load plugins:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const savePlugins = async (newPlugins: string[], pluginId: string, action: 'install' | 'uninstall') => {
    setActionLoading(pluginId);
    setErrorMsg("");
    try {
      const content = JSON.stringify({ installed: newPlugins }, null, 2);
      const { sha } = await commitFile(
        profile.pat,
        repo.owner,
        repo.name,
        CONFIG_PATH,
        content,
        configSha,
        `${action === 'install' ? 'Install' : 'Uninstall'} plugin: ${pluginId}`,
        branch
      );
      setConfigSha(sha);
      setInstalledPlugins(newPlugins);
    } catch (err: any) {
      setErrorMsg(`Failed to ${action} plugin: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleInstall = (id: string) => {
    if (installedPlugins.includes(id)) return;
    const newPlugins = [...installedPlugins, id];
    savePlugins(newPlugins, id, 'install');
  };

  const handleUninstall = (id: string) => {
    if (!installedPlugins.includes(id)) return;
    const newPlugins = installedPlugins.filter(p => p !== id);
    savePlugins(newPlugins, id, 'uninstall');
  };

  const filteredPlugins = PLUGINS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Puzzle className="text-indigo-500" size={32} />
            Plugin Store
          </h2>
          <p className="text-gray-500 mt-2 text-sm max-w-xl leading-relaxed">
            Enhance your website with powerful plugins. Install SEO tools, analytics, performance boosters, and more directly into your project.
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search plugins..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
          />
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugins.map(plugin => {
            const isInstalled = installedPlugins.includes(plugin.id);
            const isActing = actionLoading === plugin.id;

            return (
              <div 
                key={plugin.id} 
                className={`bg-white border rounded-2xl p-6 shadow-sm transition-all flex flex-col h-full ${
                  isInstalled ? "border-indigo-200 ring-1 ring-indigo-50" : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                    {plugin.icon}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {plugin.category}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-2">{plugin.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                  {plugin.description}
                </p>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-400 font-mono">v{plugin.version}</span>
                  
                  {isInstalled ? (
                    <button
                      onClick={() => handleUninstall(plugin.id)}
                      disabled={isActing}
                      className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {isActing ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Uninstall
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInstall(plugin.id)}
                      disabled={isActing}
                      className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-sm"
                    >
                      {isActing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus size={16} />
                      )}
                      Install
                    </button>
                  )}
                </div>
                
                {isInstalled && (
                  <div className="absolute top-6 right-6 flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    <CheckCircle size={14} /> Active
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {!loading && filteredPlugins.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Puzzle className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900">No plugins found</h3>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search query.</p>
        </div>
      )}
    </div>
  );
}
