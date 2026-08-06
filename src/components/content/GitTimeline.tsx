import React, { useState } from "react";
import {
  GitCommit,
  GitBranch,
  GitPullRequest,
  Clock,
  ExternalLink,
  Check,
  Plus,
} from "lucide-react";
import { CommitItem, Repo } from "../../types/index";

interface GitTimelineProps {
  repo: Repo;
  branch: string;
}

export default function GitTimeline({ repo, branch }: GitTimelineProps) {
  // Let's create visual mock branch representation
  const [branches, setBranches] = useState<string[]>([branch, "staging", "dev-feature-seo", "preview-drafts"]);
  const [selectedBranch, setSelectedBranch] = useState(branch);
  const [showCreateBranch, setShowCreateBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");

  const mockCommits: CommitItem[] = [
    {
      sha: "7f9202b",
      message: "seo: generate robots.txt crawlers and compile sitemap xml structure",
      date: "2026-06-30T18:44:21Z",
      authorName: "Priyanshu Maurya",
      authorAvatarUrl: "https://github.com/identicons/git.png",
      htmlUrl: "https://github.com",
    },
    {
      sha: "4d9e032",
      message: "feat: establish automated vercel deployment pipeline hook",
      date: "2026-06-29T14:12:05Z",
      authorName: "Priyanshu Maurya",
      authorAvatarUrl: "https://github.com/identicons/git.png",
      htmlUrl: "https://github.com",
    },
    {
      sha: "a9c8f21",
      message: "docs: add inline web branding customization rules in config",
      date: "2026-06-28T11:05:32Z",
      authorName: "Priyanshu Maurya",
      authorAvatarUrl: "https://github.com/identicons/git.png",
      htmlUrl: "https://github.com",
    },
    {
      sha: "3e4b50c",
      message: "initial: deploy AuroraCMS site blueprints",
      date: "2026-06-26T08:00:00Z",
      authorName: "GitHub Actions",
      authorAvatarUrl: "https://github.com/identicons/git.png",
      htmlUrl: "https://github.com",
    },
  ];

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim()) return;
    const cleanName = newBranchName.toLowerCase().replace(/\s+/g, "-");
    if (!branches.includes(cleanName)) {
      setBranches([...branches, cleanName]);
    }
    setSelectedBranch(cleanName);
    setNewBranchName("");
    setShowCreateBranch(false);
  };

  return (
    <div className="space-y-6 pb-24" id="git-timeline-module">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <GitCommit className="text-[#2F81F7]" size={22} />
            <span>Git Branch & Commit Activity</span>
          </h2>
          <p className="text-xs text-gray-500">
            Review recent commits, switch active branches, or fork a new working tree directly within CMS workspace.
          </p>
        </div>

        <button
          onClick={() => setShowCreateBranch(!showCreateBranch)}
          className="px-3.5 py-1.5 bg-[#f0ece1] border border-[#e6e2d6] hover:border-[#8b949e] rounded-lg text-xs font-semibold text-gray-900 flex items-center gap-1.5 transition-all self-end"
        >
          <Plus size={14} />
          <span>New Branch</span>
        </button>
      </div>

      {/* New Branch Form */}
      {showCreateBranch && (
        <form onSubmit={handleCreateBranch} className="bg-white border border-[#e6e2d6] p-4 rounded-xl space-y-3">
          <span className="text-xs font-semibold text-gray-900">Create New Git Branch</span>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. dev-contact-form"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
              className="flex-1 bg-[#fdfbf7] border border-[#e6e2d6] focus:border-blue-500 rounded-lg p-2 text-xs text-gray-900 placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-gray-900 rounded-lg text-xs font-semibold transition-all"
            >
              Fork Branch
            </button>
          </div>
        </form>
      )}

      {/* Active branch and selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Branches list */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <GitBranch size={12} className="text-[#2f81f7]" />
            <span>Repository Branches</span>
          </h3>
          <div className="space-y-1.5">
            {branches.map((b) => {
              const isActive = b === selectedBranch;
              return (
                <button
                  key={b}
                  onClick={() => setSelectedBranch(b)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all border ${
                    isActive
                      ? "bg-[#1f6feb26] border-[#388bfd] text-[#58a6ff] font-bold"
                      : "bg-transparent border-transparent text-gray-700 hover:bg-[#f0ece1]"
                  }`}
                >
                  <span className="truncate">{b}</span>
                  {isActive && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Commit Log list */}
        <div className="bg-white border border-[#e6e2d6] rounded-xl p-5 md:col-span-2 space-y-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <GitPullRequest size={12} className="text-purple-400" />
            <span>Interactive Commit Log Timeline</span>
          </h3>

          <div className="relative border-l border-[#e6e2d6] ml-4 pl-5 space-y-5">
            {mockCommits.map((commit) => (
              <div key={commit.sha} className="relative group">
                {/* Visual commit node point */}
                <div className="absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-[#161b22] bg-[#30363d] group-hover:bg-[#2f81f7] group-hover:scale-110 transition-all duration-200 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <img
                      src={commit.authorAvatarUrl}
                      alt={commit.authorName}
                      className="w-4.5 h-4.5 rounded-full border border-[#e6e2d6]"
                    />
                    <span className="text-xs font-semibold text-gray-900">{commit.authorName}</span>
                    <span className="text-[10px] text-gray-500 font-mono bg-[#f0ece1] border border-[#e6e2d6] px-1.5 py-0.5 rounded">
                      {commit.sha}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-semibold">{commit.message}</p>

                  <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      <span>{new Date(commit.date).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <a
                      href={commit.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900 flex items-center gap-0.5"
                    >
                      <span>Commit Diff</span>
                      <ExternalLink size={9} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
