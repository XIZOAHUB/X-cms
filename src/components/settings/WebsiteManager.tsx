import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Mail,
  User,
  AlertTriangle,
  Compass,
  Globe,
  FileText,
} from "lucide-react";
import { UserProfile, Repo, GlobalConfig } from "../../types/index";
import { fetchFileContent, commitFile } from "../../services/githubApi";

interface WebsiteManagerProps {
  
  repo: Repo;
  branch: string;
}

export default function WebsiteManager({ repo, branch }: WebsiteManagerProps) {
  const [config, setConfig] = useState<GlobalConfig>({
    logoText: "AuroraCMS Static Site",
    authorName: "",
    authorEmail: "",
    copyrightText: `© ${new Date().getFullYear()} All Rights Reserved`,
    socialLinks: {},
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configSha, setConfigSha] = useState<string | undefined>(undefined);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      // Look for config.json in the repository
      const fileData = await fetchFileContent(repo.owner, repo.name, "config.json", branch);
      const parsed = JSON.parse(fileData.content);
      
      setConfig({
        logoText: parsed.logoText || "AuroraCMS Static Site",
        authorName: parsed.authorName || "",
        authorEmail: parsed.authorEmail || "",
        copyrightText: parsed.copyrightText || `© ${new Date().getFullYear()} All Rights Reserved`,
        customDomain: parsed.customDomain || "",
        deploymentPlatform: parsed.deploymentPlatform || "github_pages",
        socialLinks: parsed.socialLinks || {},
      });
      setConfigSha(fileData.sha);
    } catch (err: any) {
      console.warn("Could not find a config.json file, creating new default values:", err);
      // It's expected to not find it in blank repos, we will just save a new one when requested.
      setConfigSha(undefined);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [repo, branch]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const content = JSON.stringify(config, null, 2);
      await commitFile(
        
        repo.owner,
        repo.name,
        "config.json",
        content,
        configSha,
        "config: update website branding parameters and social endpoints",
        branch
      );

      alert("Website settings successfully committed to config.json on GitHub!");
      loadConfig();
    } catch (err: any) {
      setError(err.message || "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleSocialChange = (platform: keyof GlobalConfig["socialLinks"], val: string) => {
    setConfig({
      ...config,
      socialLinks: {
        ...config.socialLinks,
        [platform]: val,
      },
    });
  };

  return (
    <div className="space-y-4 pb-24" id="website-manager-view">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-blue-400" />
          <h2 className="text-base font-semibold text-gray-900">Global Settings</h2>
        </div>
        <button
          onClick={loadConfig}
          disabled={loading}
          className="p-1.5 hover:bg-[#f0ece1] border border-[#e6e2d6] rounded-xl text-gray-700 hover:text-gray-900"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 text-gray-500 bg-white border border-[#e6e2d6] rounded-2xl">
          <RefreshCw size={32} className="animate-spin text-blue-500" />
          <p className="text-xs">Reading website config.json...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveConfig} className="space-y-4">
          
          {/* General Branding Card */}
          <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-[#e6e2d6]/50 pb-2 flex items-center gap-2">
              <Compass size={16} className="text-teal-400" />
              <span>Identity & Branding</span>
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">Website Name / Logo Text</label>
                <input
                  type="text"
                  value={config.logoText}
                  onChange={(e) => setConfig({ ...config, logoText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <User size={12} />
                    <span>Author Name</span>
                  </label>
                  <input
                    type="text"
                    value={config.authorName}
                    onChange={(e) => setConfig({ ...config, authorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="E.g., Jane Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <Mail size={12} />
                    <span>Contact Email</span>
                  </label>
                  <input
                    type="email"
                    value={config.authorEmail}
                    onChange={(e) => setConfig({ ...config, authorEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="email@domain.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">Footer Copyright Notice</label>
                <input
                  type="text"
                  value={config.copyrightText}
                  onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Hosting & Domain Card */}
          <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-[#e6e2d6]/50 pb-2 flex items-center gap-2">
              <Globe size={16} className="text-[#58a6ff]" />
              <span>Hosting & Custom Domain</span>
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">Deployment Platform</label>
                <select
                  value={config.deploymentPlatform || "github_pages"}
                  onChange={(e) => setConfig({ ...config, deploymentPlatform: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="github_pages">GitHub Pages</option>
                  <option value="cloudflare_pages">Cloudflare Pages</option>
                  <option value="vercel">Vercel</option>
                  <option value="netlify">Netlify</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">Select the edge provider where this repository is built and deployed.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium">Primary Custom Domain</label>
                <input
                  type="text"
                  value={config.customDomain || ""}
                  onChange={(e) => setConfig({ ...config, customDomain: e.target.value })}
                  placeholder="e.g. www.my-awesome-domain.com"
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[10px] text-gray-500 mt-1">Leave blank to use default subdomains. E.g. aurora-blog.io</p>
              </div>
            </div>
          </div>

          {/* Social Links Card */}
          <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-[#e6e2d6]/50 pb-2 flex items-center gap-2">
              <Youtube size={16} className="text-red-400" />
              <span>Social Connectivity</span>
            </h3>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <Youtube size={14} className="text-red-500" />
                  <span>YouTube Channel Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/c/..."
                  value={config.socialLinks.youtube || ""}
                  onChange={(e) => handleSocialChange("youtube", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <Instagram size={14} className="text-pink-500" />
                  <span>Instagram Profile Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={config.socialLinks.instagram || ""}
                  onChange={(e) => handleSocialChange("instagram", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <Facebook size={14} className="text-blue-500" />
                  <span>Facebook Page Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={config.socialLinks.facebook || ""}
                  onChange={(e) => handleSocialChange("facebook", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                  <Twitter size={14} className="text-sky-400" />
                  <span>Twitter / X Profile Link</span>
                </label>
                <input
                  type="url"
                  placeholder="https://twitter.com/..."
                  value={config.socialLinks.twitter || ""}
                  onChange={(e) => handleSocialChange("twitter", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Boilerplate Pages Generator Card */}
          <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 space-y-4 shadow-lg">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-[#e6e2d6]/50 pb-2 flex items-center gap-2">
              <FileText size={16} className="text-purple-400" />
              <span>Standard Website Pages</span>
            </h3>
            
            <div className="space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                Automatically generate standard boilerplate pages (Privacy Policy, Terms of Service, Image Gallery) for your website.
              </p>
              
              <button
                type="button"
                onClick={async () => {
                  try {
                    alert("Generating standard pages... This might take a moment if doing multiple commits.");
                    const termsContent = `---\ntitle: "Terms of Service"\n---\n# Terms of Service\n\nThese are the terms of service...`;
                    const privacyContent = `---\ntitle: "Privacy Policy"\n---\n# Privacy Policy\n\nWe care about your privacy...`;
                    const galleryContent = `---\ntitle: "Image Gallery"\n---\n# Image Gallery\n\nAdd your images here.`;
                    
                    await commitFile(repo.owner, repo.name, "pages/terms.md", termsContent, undefined, "Add Terms page", branch);
                    await commitFile(repo.owner, repo.name, "pages/privacy.md", privacyContent, undefined, "Add Privacy page", branch);
                    await commitFile(repo.owner, repo.name, "pages/gallery.md", galleryContent, undefined, "Add Gallery page", branch);
                    
                    alert("Standard pages generated successfully in /pages directory.");
                  } catch (err: any) {
                    alert("Error: " + err.message);
                  }
                }}
                className="w-full bg-[#fdfbf7] border border-purple-500/30 hover:border-purple-500 text-purple-600 font-medium py-2.5 rounded-xl text-xs transition-colors shadow-sm"
              >
                Generate "Terms", "Privacy" & "Gallery" Pages
              </button>
            </div>
          </div>

          {/* Submit Actions */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-gray-900 font-semibold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
          >
            {saving ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Commit-saving adjustments to GitHub...
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Save configurations to config.json</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

  // Available
