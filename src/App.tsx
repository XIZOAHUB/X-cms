import React, { useState, useEffect } from "react";
import { UserProfile, Repo } from "./types";
import { fetchUserRepos, fetchBranches } from "./services/githubApi";
import AuthScreen from "./components/auth/AuthScreen";
import Sidebar from "./components/layout/Sidebar";
import Dashboard from "./components/dashboard/Dashboard";
import FileManager from "./components/content/FileManager";
import BlogCMS from "./components/content/BlogCMS";
import MediaLibrary from "./components/media/MediaLibrary";
import WebsiteManager from "./components/settings/WebsiteManager";
import CloudflareManager from "./components/deploy/CloudflareManager";
import { useAuthStore } from "./store/authStore";

type ActiveTab = "dashboard" | "files" | "blog" | "media" | "website" | "deploy";

export default function App() {
  const { user, isAuthenticated, checkAuth, isLoading } = useAuthStore();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [activeBranch, setActiveBranch] = useState<string>("main");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [loadingRepos, setLoadingRepos] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const uProfile: UserProfile = {
        username: user.username,
        avatarUrl: user.avatarUrl,
      };
      setProfile(uProfile);
      
      const cachedRepo = localStorage.getItem("aurora_repo");
      const cachedBranch = localStorage.getItem("aurora_branch");
      
      loadRepos(
        cachedRepo ? JSON.parse(cachedRepo) : null,
        cachedBranch || null
      );
    }
  }, [isAuthenticated, user]);

  const loadRepos = async (initialRepo: Repo | null = null, initialBranch: string | null = null) => {
    setLoadingRepos(true);
    try {
      const userRepos = await fetchUserRepos();
      setRepos(userRepos);

      if (initialRepo && userRepos.find((r) => r.id === initialRepo.id)) {
        setSelectedRepo(initialRepo);
        const repoBranches = await fetchBranches(initialRepo.owner, initialRepo.name);
        setBranches(repoBranches);
        if (initialBranch && repoBranches.includes(initialBranch)) {
          setActiveBranch(initialBranch);
        } else if (repoBranches.length > 0) {
          setActiveBranch(repoBranches[0]);
          localStorage.setItem("aurora_branch", repoBranches[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load repos:", error);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleRepoSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const repoId = parseInt(e.target.value);
    const newRepo = repos.find((r) => r.id === repoId) || null;
    setSelectedRepo(newRepo);

    if (newRepo) {
      localStorage.setItem("aurora_repo", JSON.stringify(newRepo));
      try {
        const repoBranches = await fetchBranches(newRepo.owner, newRepo.name);
        setBranches(repoBranches);
        if (repoBranches.length > 0) {
          const newBranch = repoBranches.includes(newRepo.defaultBranch) ? newRepo.defaultBranch : repoBranches[0];
          setActiveBranch(newBranch);
          localStorage.setItem("aurora_branch", newBranch);
        } else {
          setActiveBranch("");
          localStorage.removeItem("aurora_branch");
        }
      } catch (err) {
        console.error("Failed to load branches");
      }
    } else {
      localStorage.removeItem("aurora_repo");
      localStorage.removeItem("aurora_branch");
      setBranches([]);
      setActiveBranch("");
    }
  };

  const handleBranchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBranch = e.target.value;
    setActiveBranch(newBranch);
    localStorage.setItem("aurora_branch", newBranch);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return <AuthScreen />;
  }

  const renderContent = () => {
    if (!selectedRepo) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
              <path d="M9 18c-4.51 2-5-2-7-2"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">No Repository Selected</h2>
          <p className="max-w-md text-center text-sm leading-relaxed">
            Please select a repository from the top navigation bar to start managing its content.
          </p>
        </div>
      );
    }

    if (!activeBranch) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>No branch selected. Please select or create a branch.</p>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard repo={selectedRepo} branch={activeBranch} onNavigate={setActiveTab} />;
      case "files":
        return <FileManager repo={selectedRepo} branch={activeBranch} />;
      case "blog":
        return <BlogCMS repo={selectedRepo} branch={activeBranch} />;
      case "media":
        return <MediaLibrary repo={selectedRepo} branch={activeBranch} />;
      case "website":
        return <WebsiteManager repo={selectedRepo} branch={activeBranch} />;
      case "deploy":
        return <CloudflareManager repo={selectedRepo} branch={activeBranch} />;
      default:
        return <Dashboard repo={selectedRepo} branch={activeBranch} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fdfbf7] overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#e6e2d6] flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-lg font-bold text-gray-900 tracking-tight hidden sm:block">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            <div className="flex items-center gap-3 flex-1 max-w-xl">
              <select
                value={selectedRepo?.id || ""}
                onChange={handleRepoSelect}
                className="flex-1 min-w-[200px] bg-[#f6f8fa] border border-[#e6e2d6] text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2 transition-all font-medium truncate"
                disabled={loadingRepos}
              >
                <option value="">Select Repository...</option>
                {repos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.fullName}
                  </option>
                ))}
              </select>

              {selectedRepo && (
                <select
                  value={activeBranch}
                  onChange={handleBranchSelect}
                  className="w-40 bg-[#f6f8fa] border border-[#e6e2d6] text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2 transition-all font-mono"
                >
                  <option value="">Branch...</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          {loadingRepos && (
            <div className="ml-4 flex items-center gap-2 text-sm text-gray-500 font-medium">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
              <span>Syncing...</span>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
