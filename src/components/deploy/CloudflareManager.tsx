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
  Play
} from "lucide-react";
import { UserProfile, Repo, GlobalConfig } from "../../types/index";
import { fetchFileContent, commitFile } from "../../services/githubApi";

interface CloudflareManagerProps {
  profile: UserProfile;
  repo: Repo;
  branch: string;
}

export default function CloudflareManager({ profile, repo, branch }: CloudflareManagerProps) {
  const [config, setConfig] = useState<Partial<GlobalConfig>>({});
  const [configSha, setConfigSha] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deployStatus, setDeployStatus] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const fileData = await fetchFileContent(profile.pat, repo.owner, repo.name, "config.json", branch);
      const parsed = JSON.parse(fileData.content);
      setConfig(parsed);
      setConfigSha(fileData.sha);
    } catch (err: any) {
      console.warn("Could not find a config.json file:", err);
      setConfigSha(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [repo, branch]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    try {
      const content = JSON.stringify(config, null, 2);
      await commitFile(
        profile.pat,
        repo.owner,
        repo.name,
        "config.json",
        content,
        "Update Cloudflare Pages settings",
        branch,
        configSha
      );
      await loadConfig();
      alert("Cloudflare settings saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const triggerDeploy = async () => {
    if (!config.cloudflareDeployHookUrl) return;
    setIsDeploying(true);
    setDeployStatus("Triggering deployment...");
    try {
      const res = await fetch(config.cloudflareDeployHookUrl, {
        method: "POST",
      });
      if (res.ok) {
        setDeployStatus("✅ Deployment triggered successfully! Your site will update in a few minutes.");
      } else {
        setDeployStatus("❌ Failed to trigger deployment. Check your Deploy Hook URL.");
      }
    } catch (error) {
      setDeployStatus("❌ Error connecting to Deploy Hook. Ensure it is a valid Cloudflare URL.");
    } finally {
      setIsDeploying(false);
      setTimeout(() => setDeployStatus(null), 5000);
    }
  };

  return (
    <div className="space-y-6 pb-24" id="cloudflare-manager-view">
      {/* Cloudflare Pages Panel Banner */}
      <div className="bg-gradient-to-br from-orange-950/20 via-[#161b22] to-[#161b22] border border-[#e6e2d6] rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="text-orange-400 fill-orange-500/20" size={20} />
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Cloudflare Pages Manager</h2>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Connect your GitHub repository to a dedicated Cloudflare Pages project. Use Deploy Hooks to trigger lightning-fast builds globally without touching DNS.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-400 text-sm">
          <AlertTriangle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Setup */}
        <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 space-y-5">
          <div className="border-b border-[#e6e2d6]/50 pb-3 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Link size={16} className="text-orange-400" />
              Pages Connection Setup
            </span>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Cloudflare Project Name (Optional)</label>
              <input
                type="text"
                value={config.cloudflareProjectName || ""}
                onChange={(e) => setConfig({ ...config, cloudflareProjectName: e.target.value })}
                placeholder="e.g. my-awesome-blog"
                className="w-full bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 font-medium">Deploy Hook URL</label>
              <input
                type="password"
                value={config.cloudflareDeployHookUrl || ""}
                onChange={(e) => setConfig({ ...config, cloudflareDeployHookUrl: e.target.value })}
                placeholder="https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/..."
                className="w-full bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-orange-500/50 font-mono"
              />
              <p className="text-[10px] text-gray-500 pt-1 leading-relaxed">
                Found in Cloudflare Dashboard → Pages → Settings → Builds & deployments → Deploy hooks. This allows this CMS to trigger updates securely.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full bg-orange-600 hover:bg-orange-500 text-gray-900 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Saving Connection..." : "Save Connection Details"}
            </button>
          </div>
        </div>

        {/* Deploy Actions */}
        <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 space-y-5">
          <div className="border-b border-[#e6e2d6]/50 pb-3 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Play size={16} className="text-orange-400" />
              Deployment Control
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
              {config.cloudflareDeployHookUrl ? "CONNECTED" : "NOT CONFIGURED"}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-4 py-4">
            <p className="text-xs text-gray-400 leading-relaxed text-center">
              Once connected, you can manually trigger a Cloudflare Pages deployment. This pulls your latest commits from the <strong className="text-gray-900">{branch}</strong> branch and pushes them live.
            </p>

            <button
              onClick={triggerDeploy}
              disabled={isDeploying || !config.cloudflareDeployHookUrl}
              className="w-full bg-[#fdfbf7] border border-orange-500/30 hover:border-orange-500 hover:bg-orange-950/20 text-orange-400 font-bold py-4 px-4 rounded-xl text-sm transition-all shadow flex flex-col items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RefreshCw size={24} className={isDeploying ? "animate-spin" : ""} /> 
              {isDeploying ? "Building & Deploying..." : "Trigger Live Deployment"}
            </button>

            {deployStatus && (
              <div className="text-center text-xs font-semibold mt-2 animate-fade-in text-gray-700">
                {deployStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
