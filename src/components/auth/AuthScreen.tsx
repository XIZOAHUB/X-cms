import React, { useState, useEffect } from "react";
import { Key, Github, RefreshCw, ChevronRight, AlertCircle, HelpCircle } from "lucide-react";
import { UserProfile, Repo } from "../../types/index";
import { fetchUserProfile, fetchUserRepos, fetchBranches } from "../../services/githubApi";

interface AuthScreenProps {
  onConnected: (profile: UserProfile, repo: Repo, branch: string) => void;
  savedProfile: UserProfile | null;
  savedRepo: Repo | null;
  savedBranch: string | null;
}

export default function AuthScreen({ onConnected, savedProfile, savedRepo, savedBranch }: AuthScreenProps) {
  const [pat, setPat] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [cloudflareToken, setCloudflareToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  // Load saved configurations if they exist
  useEffect(() => {
    if (savedProfile) {
      setPat(savedProfile.pat);
      if (savedProfile.geminiKey) setGeminiKey(savedProfile.geminiKey);
      if (savedProfile.cloudflareToken) setCloudflareToken(savedProfile.cloudflareToken);
      setUserProfile(savedProfile);
      loadRepos(savedProfile.pat, savedRepo, savedBranch);
    }
  }, [savedProfile]);

  const loadRepos = async (token: string, preSelectRepo: Repo | null = null, preSelectBranch: string | null = null) => {
    setLoading(true);
    setError(null);
    try {
      const repositoryList = await fetchUserRepos(token);
      setRepos(repositoryList);

      if (preSelectRepo) {
        const matching = repositoryList.find((r) => r.fullName === preSelectRepo.fullName);
        if (matching) {
          setSelectedRepo(matching);
          // Fetch branches for preselected
          const branchList = await fetchBranches(token, matching.owner, matching.name);
          setBranches(branchList);
          if (preSelectBranch && branchList.includes(preSelectBranch)) {
            setSelectedBranch(preSelectBranch);
          } else {
            setSelectedBranch(matching.defaultBranch || branchList[0] || "main");
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load repositories. Please check your network and token permissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pat.trim()) {
      setError("Please provide a valid GitHub Personal Access Token.");
      return;
    }

    setLoading(true);
    setError(null);
    setUserProfile(null);
    setRepos([]);
    setSelectedRepo(null);

    try {
      const profile = await fetchUserProfile(pat.trim());
      const extendedProfile = {
        ...profile,
        geminiKey: geminiKey.trim(),
        cloudflareToken: cloudflareToken.trim(),
      };
      setUserProfile(extendedProfile);
      await loadRepos(pat.trim());
    } catch (err: any) {
      setError(err.message || "Invalid token or network error. Please verify your token.");
    } finally {
      setLoading(false);
    }
  };

  const handleRepoSelect = async (repoId: number) => {
    const repo = repos.find((r) => r.id === repoId);
    if (!repo) return;

    setSelectedRepo(repo);
    setLoading(true);
    setError(null);

    try {
      const branchList = await fetchBranches(pat, repo.owner, repo.name);
      setBranches(branchList);
      setSelectedBranch(repo.defaultBranch || branchList[0] || "main");
    } catch (err: any) {
      setError("Failed to fetch repository branches. Ensure the token has 'repo' permission scopes.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmConnection = () => {
    if (userProfile && selectedRepo && selectedBranch) {
      onConnected(userProfile, selectedRepo, selectedBranch);
    }
  };

  const handleDisconnect = () => {
    setPat("");
    setUserProfile(null);
    setRepos([]);
    setSelectedRepo(null);
    setBranches([]);
    setSelectedBranch("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-gray-700 flex flex-col justify-center px-4 py-8 font-sans" id="auth-screen">
      <div className="max-w-md w-full mx-auto space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-gray-900 shadow-lg shadow-blue-900/30">
            <Github size={32} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mt-3">AuroraCMS</h1>
          <p className="text-sm text-gray-500">The Ultimate Mobile-First GitHub CMS</p>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-[#e6e2d6] rounded-2xl p-6 shadow-xl space-y-6">
          {!userProfile ? (
            /* Step 1: Input PAT */
            <form onSubmit={handleConnectToken} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-900">
                  GitHub Personal Access Token (PAT)
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1 focus:outline-none"
                >
                  <HelpCircle size={14} />
                  {showHelp ? "Hide Help" : "How to create?"}
                </button>
              </div>

              {showHelp && (
                <div className="text-xs bg-[#fdfbf7] border border-[#e6e2d6] p-3 rounded-lg text-gray-500 space-y-2 leading-relaxed">
                  <p className="font-semibold text-gray-900">To create a token:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Go to GitHub settings &gt; Developer settings</li>
                    <li>Select <span className="text-gray-900">Personal Access Tokens</span> &gt; Tokens (classic)</li>
                    <li>Click <span className="text-gray-900">Generate new token</span></li>
                    <li>Enable the <span className="text-blue-400">repo</span> scope (fully check the "repo" box)</li>
                    <li>Copy the token and paste it below!</li>
                  </ol>
                  <p className="text-[10px] text-amber-500">Note: Your PAT is stored locally on your device and is never sent to any third-party servers.</p>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Key size={18} />
                </div>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={pat}
                  onChange={(e) => setPat(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-900">
                  Gemini API Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Key size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="AI Studio API Key (for AI features)"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-900">
                  Cloudflare API Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Key size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="For triggering deployments (Optional)"
                    value={cloudflareToken}
                    onChange={(e) => setCloudflareToken(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !pat.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 disabled:text-gray-500 text-gray-900 font-medium py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Connecting to GitHub...
                  </>
                ) : (
                  <>
                    Connect GitHub Account
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Select Repository and Branch */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl">
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.username}
                  className="w-10 h-10 rounded-full border border-[#e6e2d6]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Authenticated as</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">@{userProfile.username}</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-xs text-red-400 hover:underline px-2 py-1"
                >
                  Change Account
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-900">
                  Select Website Repository
                </label>
                {repos.length === 0 && !loading ? (
                  <p className="text-xs text-gray-500 p-3 bg-[#fdfbf7] rounded-lg">No repositories found. Create one on GitHub first.</p>
                ) : (
                  <select
                    value={selectedRepo?.id || ""}
                    onChange={(e) => handleRepoSelect(Number(e.target.value))}
                    className="w-full px-3 py-3 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={loading}
                  >
                    <option value="" disabled>-- Select a GitHub Repository --</option>
                    {repos.map((repo) => (
                      <option key={repo.id} value={repo.id}>
                        {repo.fullName} {repo.private ? "🔒" : "🌐"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedRepo && (
                <div className="space-y-2 animate-fade-in">
                  <label className="block text-sm font-medium text-gray-900">
                    Select Target Branch
                  </label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full px-3 py-3 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={loading}
                  >
                    {branches.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleConfirmConnection}
                disabled={loading || !selectedRepo || !selectedBranch}
                className="w-full mt-4 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800/40 disabled:text-gray-500 text-gray-900 font-medium py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Fetching repo info...
                  </>
                ) : (
                  "Open CMS Dashboard"
                )}
              </button>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-500">
          AuroraCMS operates entirely in your web browser. No databases. No central servers.
        </div>
      </div>
    </div>
  );
}
