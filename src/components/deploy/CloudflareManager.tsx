import React, { useState, useEffect } from "react";
import {
  Globe,
  Settings,
  Database,
  Cpu,
  Shield,
  Zap,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Save,
  Link,
  Play,
  Activity,
  Clock,
  ExternalLink
} from "lucide-react";
import { UserProfile, Repo } from "../../types";
import {
  fetchPagesProjects,
  fetchProjectDomains,
  fetchDeployments,
  triggerDeployment,
  CloudflareProject,
  CloudflareDeployment,
  CloudflareDomain
} from "../../services/cloudflareApi";

interface CloudflareManagerProps {
  
  repo: Repo;
  branch: string;
}

export default function CloudflareManager({ repo, branch }: CloudflareManagerProps) {
  const [projects, setProjects] = useState<CloudflareProject[]>([]);
  const [activeProject, setActiveProject] = useState<CloudflareProject | null>(null);
  const [deployments, setDeployments] = useState<CloudflareDeployment[]>([]);
  const [domains, setDomains] = useState<CloudflareDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, [repo]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const allProjects = await fetchPagesProjects();
      setProjects(allProjects);
      
      const matched = allProjects.find(
        p => p.source?.config?.owner?.toLowerCase() === repo.owner.toLowerCase() &&
             p.source?.config?.repo_name?.toLowerCase() === repo.name.toLowerCase()
      );
      
      if (matched) {
        await selectProject(matched);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load Cloudflare projects");
    } finally {
      setLoading(false);
    }
  };

  const selectProject = async (project: CloudflareProject) => {
    setActiveProject(project);
    setLoading(true);
    try {
      const [deps, doms] = await Promise.all([
        fetchDeployments(project.name),
        fetchProjectDomains(project.name)
      ]);
      setDeployments(deps);
      setDomains(doms);
    } catch (err: any) {
      setError(err.message || "Failed to fetch project details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!activeProject) return;
    setDeploying(true);
    setError(null);
    try {
      await triggerDeployment(activeProject.name);
      setTimeout(async () => {
        const deps = await fetchDeployments(activeProject.name);
        setDeployments(deps);
        setDeploying(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to trigger deployment.");
      setDeploying(false);
    }
  };

  return (
    <div className="space-y-6 pb-24" id="cloudflare-manager-view">
      <div className="bg-gradient-to-br from-orange-950/20 via-[#161b22] to-[#161b22] border border-orange-500/20 rounded-2xl p-5 shadow-lg space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Globe size={120} />
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <Globe className="text-orange-500" size={24} />
          <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Cloudflare Pages Infrastructure</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed relative z-10 max-w-2xl">
          Viewing live production data directly via the Cloudflare API. See deployments, analytics, and custom domains connected to your GitHub repository in real-time.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <AlertTriangle size={18} className="text-red-500" />
          {error}
        </div>
      )}

      {!activeProject && !loading && (
        <div className="bg-white border border-[#e6e2d6] rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">Select Cloudflare Pages Project</h3>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-500">No Pages projects found in your Cloudflare account.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map(p => (
                <button 
                  key={p.name}
                  onClick={() => selectProject(p)}
                  className="text-left p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-colors flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-gray-900">{p.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{p.subdomain}</p>
                    {p.source?.config?.repo_name && (
                      <p className="text-[10px] text-orange-600 font-medium mt-2 bg-orange-100 inline-block px-2 py-0.5 rounded">
                        Repo: {p.source.config.owner}/{p.source.config.repo_name}
                      </p>
                    )}
                  </div>
                  <ArrowRight size={18} className="text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading && !deploying && (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium animate-pulse">Syncing Cloudflare API...</p>
        </div>
      )}

      {activeProject && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{activeProject.name}</h3>
                  <a href={`https://${activeProject.subdomain}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                    {activeProject.subdomain} <ExternalLink size={10} />
                  </a>
                </div>
                <button onClick={() => setActiveProject(null)} className="text-xs text-gray-400 hover:text-gray-700">Change</button>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Custom Domains</h4>
                {domains.length === 0 ? (
                  <p className="text-xs text-gray-500">No custom domains configured.</p>
                ) : (
                  <ul className="space-y-2">
                    {domains.map(d => (
                      <li key={d.id} className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <a href={`https://${d.name}`} target="_blank" rel="noreferrer" className="font-medium text-gray-800 hover:text-orange-600 truncate mr-2">
                          {d.name}
                        </a>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${d.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {d.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button
              onClick={handleDeploy}
              disabled={deploying}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-4 rounded-2xl text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deploying ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Play size={16} className="text-orange-400" />
              )}
              {deploying ? "Triggering Build..." : "Force New Deployment"}
            </button>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 shadow-sm h-full">
              <div className="border-b border-[#e6e2d6]/50 pb-4 mb-4 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Activity size={16} className="text-orange-500" />
                  Real-time Deployment Analytics
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
                  {deployments.length} latest builds
                </span>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {deployments.length === 0 ? (
                  <p className="text-sm text-gray-500 py-10 text-center">No recent deployments found.</p>
                ) : (
                  deployments.map(dep => (
                    <div key={dep.id} className="border border-gray-100 bg-gray-50/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gray-600 bg-gray-200 px-1.5 py-0.5 rounded">
                            {dep.id.substring(0, 8)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            dep.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                            dep.status === 'failure' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700 animate-pulse'
                          }`}>
                            {dep.status}
                          </span>
                          {dep.environment === 'production' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              PROD
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {new Date(dep.created_on).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {dep.url && (
                          <a 
                            href={dep.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs font-medium text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 transition-colors"
                          >
                            View Build
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
