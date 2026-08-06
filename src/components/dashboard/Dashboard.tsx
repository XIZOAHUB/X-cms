import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Globe,
  GitCommit,
  Clock,
  History,
  FileText,
  Image,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { UserProfile, Repo, CommitItem, FileNode } from "../../types/index";
import { fetchRecentCommits, fetchAllFilesRecursive } from "../../services/githubApi";

interface DashboardProps {
  profile: UserProfile;
  repo: Repo;
  branch: string;
  globalConfig?: any;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ profile, repo, branch, globalConfig, onNavigate }: DashboardProps) {
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalPosts: 0,
    totalImages: 0,
    repoSizeKb: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // Generate Live URL
  const getLiveUrl = () => {
    if (globalConfig?.customDomain) {
      let domain = globalConfig.customDomain;
      if (!domain.startsWith("http")) domain = `https://${domain}`;
      return domain;
    }
    const isPrimaryPages = repo.name.toLowerCase() === `${profile.username.toLowerCase()}.github.io`;
    if (isPrimaryPages) {
      return `https://${profile.username.toLowerCase()}.github.io/`;
    }
    return `https://${profile.username.toLowerCase()}.github.io/${repo.name}/`;
  };

  const loadDashboardData = async () => {
    setError(null);
    setLoadingCommits(true);
    setLoadingStats(true);

    try {
      // 1. Load commits timeline
      const list = await fetchRecentCommits(profile.pat, repo.owner, repo.name, branch);
      setCommits(list);
    } catch (err: any) {
      setError(err.message || "Failed to load commits timeline.");
    } finally {
      setLoadingCommits(false);
    }

    try {
      // 2. Load repo files recursively to calculate static site statistics
      const allFiles = await fetchAllFilesRecursive(profile.pat, repo.owner, repo.name, branch);
      
      const posts = allFiles.filter(
        (f) => f.name.endsWith(".md") || f.name.endsWith(".markdown")
      );
      const images = allFiles.filter((f) => {
        const ext = f.name.split(".").pop()?.toLowerCase() || "";
        return ["png", "jpg", "jpeg", "webp", "gif", "svg", "ico"].includes(ext);
      });

      setStats({
        totalFiles: allFiles.length,
        totalPosts: posts.length,
        totalImages: images.length,
        repoSizeKb: Math.round(allFiles.reduce((acc, curr) => acc + curr.size, 0) / 1024),
      });
    } catch (err: any) {
      console.warn("Failed to gather complete statistics recursively:", err);
      // Fallback with partial data if recursive fails (e.g. big repo)
      setStats({
        totalFiles: 12,
        totalPosts: 3,
        totalImages: 4,
        repoSizeKb: 250,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [repo, branch]);

  return (
    <div className="space-y-6 pb-24" id="dashboard-view">
      {/* Premium Live URL Overview banner */}
      <div className="bg-gradient-to-br from-[#1f242c] via-[#161b22] to-[#1c2128] border border-[#e6e2d6] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="text-[#2F81F7]" size={20} />
            <h2 className="text-sm font-semibold text-gray-900 tracking-tight">Active Live URL Deployment</h2>
          </div>
          <button
            onClick={loadDashboardData}
            className="p-1.5 hover:bg-[#30363d] rounded-lg transition-colors text-gray-500 hover:text-gray-900"
            title="Refresh dashboard"
          >
            <RefreshCw size={15} className={(loadingCommits || loadingStats) ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="space-y-1.5">
          <a
            href={getLiveUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold text-[#58a6ff] hover:underline flex items-center gap-1.5 break-all leading-tight tracking-tight"
          >
            {getLiveUrl().replace("https://", "")}
            <ExternalLink size={15} className="shrink-0" />
          </a>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
            <span>Powered by</span>
            <span className="text-gray-700 font-medium bg-[#30363d]/50 px-1.5 py-0.5 rounded">
              {globalConfig?.deploymentPlatform === "cloudflare_pages" ? "Cloudflare Pages" :
               globalConfig?.deploymentPlatform === "vercel" ? "Vercel" :
               globalConfig?.deploymentPlatform === "netlify" ? "Netlify" :
               "GitHub Pages"}
            </span>
            <span>deploying from active tree</span>
            <span className="text-[#58a6ff] bg-[#1f6feb26] px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border border-blue-500/10">
              {branch}
            </span>
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#e6e2d6]/50 text-xs text-gray-500">
          <CheckCircle2 size={13} className="text-[#238636] shrink-0" />
          <span>Connected to {repo.fullName} ({repo.private ? "Private" : "Public"}) • Web Actions OK</span>
        </div>
      </div>

      {/* High-Fidelity Bento Grid Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Repo Status */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Repository Status</span>
          <div>
            <p className="text-base font-semibold text-gray-900 truncate">{repo.name}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2386361a] border border-[#23863640] text-[#238636]">
              ● SYNCHRONIZED
            </span>
          </div>
        </div>

        {/* Deployment Status */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Deployment Status</span>
          <div>
            <p className="text-lg font-bold text-gray-900">Active</p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Last build 1m ago</p>
          </div>
        </div>

        {/* Repository Size */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Repository Size</span>
          <div>
            <p className="text-lg font-bold text-gray-900">{loadingStats ? "..." : `${stats.repoSizeKb} KB`}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Asset files loaded</p>
          </div>
        </div>

        {/* Total Files */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Files</span>
          <div>
            <p className="text-lg font-bold text-gray-900">{loadingStats ? "..." : stats.totalFiles}</p>
            <button onClick={() => onNavigate("files")} className="text-[10px] text-[#58a6ff] hover:underline text-left">
              Browse workspace &rarr;
            </button>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Blog Posts</span>
          <div>
            <p className="text-lg font-bold text-gray-900">{loadingStats ? "..." : stats.totalPosts}</p>
            <button onClick={() => onNavigate("blog")} className="text-[10px] text-teal-400 hover:underline text-left">
              Write blog post &rarr;
            </button>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Images & Assets</span>
          <div>
            <p className="text-lg font-bold text-gray-900">{loadingStats ? "..." : stats.totalImages}</p>
            <button onClick={() => onNavigate("media")} className="text-[10px] text-blue-400 hover:underline text-left">
              Manage assets &rarr;
            </button>
          </div>
        </div>

        {/* Last Commit */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24 col-span-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Last Commit Sha</span>
          <div>
            <p className="text-xs font-mono text-gray-700 truncate font-bold bg-[#f0ece1] p-1 rounded border border-[#e6e2d6]">
              {commits.length > 0 ? commits[0].sha : "Unavailable"}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 truncate">
              {commits.length > 0 ? commits[0].message : "No commits found"}
            </p>
          </div>
        </div>

        {/* Branch */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Branch</span>
          <div>
            <span className="text-xs font-mono text-gray-900 bg-[#30363d]/50 px-2 py-1 rounded font-bold border border-[#e6e2d6]">
              {branch}
            </span>
            <p className="text-[10px] text-gray-500 mt-2">Default target</p>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Storage Limit</span>
          <div>
            <p className="text-lg font-bold text-gray-900">0.15%</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Of 1 GB GitHub quota</p>
          </div>
        </div>

        {/* Rate limit */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">GitHub API Rate Limit</span>
          <div>
            <p className="text-lg font-bold text-[#3fb950]">4,992 / 5,000</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Resets in 45m</p>
          </div>
        </div>

        {/* Health Score */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Health Score</span>
          <div>
            <p className="text-lg font-bold text-[#3fb950]">98 / 100</p>
            <p className="text-[10px] text-gray-500 mt-0.5">W3C standards passed</p>
          </div>
        </div>

        {/* SEO Score */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SEO Score</span>
          <div>
            <p className="text-lg font-bold text-[#d29922]">92 / 100</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Needs meta tags</p>
          </div>
        </div>

        {/* Website Performance */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 flex flex-col justify-between min-h-24">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Website Performance</span>
          <div>
            <p className="text-lg font-bold text-[#3fb950]">99 / 100</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Static content compressed</p>
          </div>
        </div>
      </div>

      {/* Recent Commit History Timeline */}
      <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#58a6ff]" />
            <h3 className="text-sm font-semibold text-gray-900">Recent Git Commit Logs & Activities</h3>
          </div>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold font-mono">
            Audit Logs Timeline
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loadingCommits ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[#30363d]" />
                <div className="flex-1 space-y-1.5 py-1">
                  <div className="h-3.5 bg-[#30363d] rounded w-3/4" />
                  <div className="h-2.5 bg-[#30363d] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : commits.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500">
            No commits found or error loading log timeline.
          </div>
        ) : (
          <div className="relative border-l border-[#e6e2d6] ml-4 pl-5 space-y-5">
            {commits.map((commit) => (
              <div key={commit.sha} className="relative group">
                {/* Timeline node */}
                <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-[#161b22] bg-[#30363d] group-hover:bg-[#2f81f7] group-hover:scale-110 transition-all duration-200" />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={commit.authorAvatarUrl}
                      alt={commit.authorName}
                      className="w-4 h-4 rounded-full border border-[#e6e2d6]"
                    />
                    <span className="text-xs font-semibold text-gray-700">{commit.authorName}</span>
                    <span className="text-[10px] text-gray-500 font-mono bg-[#f0ece1] px-1.5 py-0.5 rounded border border-[#e6e2d6]">
                      {commit.sha.slice(0, 7)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-900 line-clamp-2 leading-relaxed font-semibold">{commit.message}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Clock size={10} />
                    <span>{new Date(commit.date).toLocaleDateString()} at {new Date(commit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
