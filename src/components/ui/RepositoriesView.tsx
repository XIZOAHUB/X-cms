import React, { useState } from "react";
import {
  GitFork,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FolderPlus,
  GitBranch,
} from "lucide-react";
import { Repo, UserProfile } from "../../types/index";

interface RepositoriesViewProps {
  profile: UserProfile;
  selectedRepo: Repo;
  activeBranch: string;
  onRepoChange: (repo: Repo) => void;
  onBranchChange: (branch: string) => void;
}

export default function RepositoriesView({
  profile,
  selectedRepo,
  activeBranch,
  onRepoChange,
  onBranchChange,
}: RepositoriesViewProps) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([
    selectedRepo,
    {
      id: 28410521,
      name: "personal-blog-theme",
      owner: selectedRepo.owner,
      fullName: `${selectedRepo.owner}/personal-blog-theme`,
      description: "My personal blog website powered by static markdown pages.",
      private: false,
      defaultBranch: "main",
      htmlUrl: `https://github.com/${selectedRepo.owner}/personal-blog-theme`,
    },
    {
      id: 99420124,
      name: "portfolio-nextgen",
      owner: selectedRepo.owner,
      fullName: `${selectedRepo.owner}/portfolio-nextgen`,
      description: "Interactive premium developer portfolio static landing page.",
      private: true,
      defaultBranch: "main",
      htmlUrl: `https://github.com/${selectedRepo.owner}/portfolio-nextgen`,
    },
  ]);

  const [newRepoName, setNewRepoName] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;

    setLoading(true);
    setTimeout(() => {
      const name = newRepoName.toLowerCase().replace(/\s+/g, "-");
      const newRepo: Repo = {
        id: Date.now(),
        name,
        owner: profile.username,
        fullName: `${profile.username}/${name}`,
        description: "Static website generated and managed by AuroraCMS Mobile CMS",
        private: false,
        defaultBranch: "main",
        htmlUrl: `https://github.com/${profile.username}/${name}`,
      };
      setRepos([...repos, newRepo]);
      onRepoChange(newRepo);
      setNewRepoName("");
      setLoading(false);
      setSuccess(`Repository "${newRepo.name}" created successfully in CMS memory!`);
    }, 1200);
  };

  const filteredRepos = repos.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 pb-24" id="repositories-view-module">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <GitFork className="text-[#2F81F7]" size={22} />
          <span>GitHub Repositories Manager</span>
        </h2>
        <p className="text-xs text-gray-500">
          Switch active repositories, modify connected target branches, or bootstrap new web projects directly.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-[#2386361a] border border-[#23863640] rounded-xl text-xs text-[#58a6ff] flex items-start gap-2">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#238636]" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid: Search & Add project */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search repositories in your GitHub account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-[#e6e2d6] focus:border-blue-500 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-900 placeholder-gray-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2.5">
            {filteredRepos.map((r) => {
              const isSelected = r.id === selectedRepo.id;
              return (
                <div
                  key={r.id}
                  onClick={() => onRepoChange(r)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-[#1f6feb26] border-[#388bfd]"
                      : "bg-white border-[#e6e2d6] hover:border-[#8b949e]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{r.name}</span>
                      <span className="bg-[#30363d]/50 border border-[#e6e2d6] text-[10px] text-gray-300 font-mono px-1.5 py-0.5 rounded">
                        {r.private ? "Private" : "Public"}
                      </span>
                      {isSelected && (
                        <span className="bg-[#2386361a] border border-[#23863640] text-[10px] text-[#238636] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={10} />
                          Active
                        </span>
                      )}
                    </div>
                    {r.description && <p className="text-xs text-gray-500">{r.description}</p>}
                    <p className="text-[10px] text-gray-500 font-mono mt-2">Owner: {r.owner}</p>
                  </div>

                  <GitBranch size={16} className={isSelected ? "text-[#58a6ff]" : "text-gray-600"} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Create repo project card */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-5 space-y-4 self-start shadow-md">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <FolderPlus className="text-[#238636]" size={16} />
            <span>Bootstrap Repository</span>
          </h3>
          <p className="text-xs text-gray-500">
            Create a clean, ready-to-go HTML static site repository directly linked to your GitHub.
          </p>

          <form onSubmit={handleCreateRepo} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Repository Name</label>
              <input
                type="text"
                required
                placeholder="e.g. portfolio-2026"
                value={newRepoName}
                onChange={(e) => setNewRepoName(e.target.value)}
                className="w-full bg-[#fdfbf7] border border-[#e6e2d6] focus:border-blue-500 rounded-lg p-2.5 text-xs text-gray-900 placeholder-gray-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-gray-900 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Bootstrapping..." : "Create Repository"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
