import React, { useState, useEffect } from "react";
import { FileText, Image as ImageIcon, GitCommit, Settings, Globe, Plus, ArrowRight, Activity, Clock, Zap } from "lucide-react";
import { Repo, CommitItem, FileNode } from "../../types";
import { fetchRecentCommits, fetchAllFilesRecursive } from "../../services/githubApi";
import { useAuthStore } from "../../store/authStore";

interface DashboardProps {
  repo: Repo;
  branch: string;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ repo, branch, onNavigate }: DashboardProps) {
  const { user } = useAuthStore();
  const [commits, setCommits] = useState<CommitItem[]>([]);
  const [stats, setStats] = useState({
    posts: 0,
    images: 0,
    totalFiles: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [repo, branch]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const list = await fetchRecentCommits(repo.owner, repo.name, branch);
      setCommits(list);

      const allFiles = await fetchAllFilesRecursive(repo.owner, repo.name, branch);
      let postsCount = 0;
      let imagesCount = 0;

      allFiles.forEach(f => {
        const ext = f.name.split('.').pop()?.toLowerCase();
        if (ext === 'md' || ext === 'mdx') postsCount++;
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) imagesCount++;
      });

      setStats({
        posts: postsCount,
        images: imagesCount,
        totalFiles: allFiles.length
      });
    } catch (err) {
      console.error("Dashboard failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Welcome back, {user?.username}
        </h2>
        <p className="text-gray-500 mt-1">
          Here's what's happening with <strong className="text-gray-700">{repo.name}</strong> on branch <strong className="text-gray-700 font-mono text-xs">{branch}</strong>.
        </p>
      </header>

      {/* Overview Cards  ka upadte*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 shadow-sm hover:border-blue-500/30 transition-colors group cursor-pointer" onClick={() => onNavigate("blog")}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText size={20} />
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{loading ? "..." : stats.posts}</h3>
          <p className="text-sm font-medium text-gray-500 mt-1">Markdown Posts</p>
        </div>

        <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 shadow-sm hover:border-purple-500/30 transition-colors group cursor-pointer" onClick={() => onNavigate("media")}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ImageIcon size={20} />
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{loading ? "..." : stats.images}</h3>
          <p className="text-sm font-medium text-gray-500 mt-1">Media Assets</p>
        </div>

        <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 shadow-sm hover:border-emerald-500/30 transition-colors group cursor-pointer" onClick={() => onNavigate("files")}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Settings size={20} />
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{loading ? "..." : stats.totalFiles}</h3>
          <p className="text-sm font-medium text-gray-500 mt-1">Total Files</p>
        </div>

        <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 shadow-sm hover:border-orange-500/30 transition-colors group cursor-pointer" onClick={() => onNavigate("deploy")}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Globe size={20} />
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900">Live</h3>
          <p className="text-sm font-medium text-gray-500 mt-1">Deploy Status</p>
        </div>
      </div>

      {/* Activity / Commits */}
      <div className="bg-white border border-[#e6e2d6] rounded-2xl shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-[#e6e2d6] flex justify-between items-center bg-[#fdfbf7]">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Activity size={18} className="text-blue-500" />
            Recent Activity
          </h3>
          <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
            View on GitHub &rarr;
          </a>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-2"></div>
              Loading activity...
            </div>
          ) : commits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No recent activity found.</div>
          ) : (
            commits.map(commit => (
              <div key={commit.sha} className="p-5 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                <img src={commit.authorAvatarUrl} alt={commit.authorName} className="w-10 h-10 rounded-full bg-gray-200 border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{commit.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{commit.authorName}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {new Date(commit.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <a href={commit.htmlUrl} target="_blank" rel="noreferrer" className="text-[10px] font-mono text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors hidden sm:block">
                  {commit.sha.substring(0, 7)}
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
