import { useState, useEffect } from "react";
import {
  Globe,
  Share2,
  FileCode,
  Save,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { UserProfile, Repo } from "../../types/index";
import { fetchFileContent, commitFile, fetchAllFilesRecursive } from "../../services/githubApi";

interface SeoSuiteProps {
  profile: UserProfile;
  repo: Repo;
  branch: string;
}

export default function SeoSuite({ profile, repo, branch }: SeoSuiteProps) {
  const [activeTab, setActiveTab] = useState<"social" | "robots" | "sitemap">("social");

  // Social OG state
  const [ogTitle, setOgTitle] = useState(`${repo.name} - Blog & Portfolio`);
  const [ogDesc, setOgDesc] = useState("Explore recent updates, articles, and works directly on my GitHub Pages website.");
  const [ogImage, setOgImage] = useState("https://github.com/identicons/git.png");

  // robots.txt state
  const [robotsContent, setRobotsContent] = useState("User-agent: *\nAllow: /\n\nSitemap: https://" + profile.username.toLowerCase() + ".github.io/" + repo.name + "/sitemap.xml");
  const [robotsSha, setRobotsSha] = useState<string | undefined>(undefined);
  const [loadingRobots, setLoadingRobots] = useState(false);
  const [savingRobots, setSavingRobots] = useState(false);

  // sitemap.xml state
  const [sitemapContent, setSitemapContent] = useState("");
  const [loadingSitemap, setLoadingSitemap] = useState(false);
  const [savingSitemap, setSavingSitemap] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Load robots.txt
  const loadRobotsFile = async () => {
    setLoadingRobots(true);
    setError(null);
    try {
      const data = await fetchFileContent(profile.pat, repo.owner, repo.name, "robots.txt", branch);
      setRobotsContent(data.content);
      setRobotsSha(data.sha);
    } catch (err: any) {
      console.warn("robots.txt not found, loading safe default:", err);
      setRobotsSha(undefined);
    } finally {
      setLoadingRobots(false);
    }
  };

  // Generate Sitemap list based on existing repo files
  const generateXmlSitemap = async () => {
    setLoadingSitemap(true);
    setError(null);
    try {
      const allFiles = await fetchAllFilesRecursive(profile.pat, repo.owner, repo.name, branch);
      const urlBase = `https://${profile.username.toLowerCase()}.github.io/${repo.name}/`;

      const staticPages = allFiles.filter(
        (f) => f.name.endsWith(".html") || f.name.endsWith(".md")
      );

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Main index
      xml += `  <url>\n    <loc>${urlBase}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

      staticPages.forEach((page) => {
        if (page.path !== "index.html" && page.path !== "404.html" && !page.path.startsWith("node_modules/")) {
          const cleanPath = page.path.replace(/\.md$/, ".html");
          xml += `  <url>\n    <loc>${urlBase}${cleanPath}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
        }
      });

      xml += `</urlset>`;
      setSitemapContent(xml);
    } catch (err: any) {
      setError(err.message || "Failed to parse files list for Sitemap.");
    } finally {
      setLoadingSitemap(false);
    }
  };

  useEffect(() => {
    if (activeTab === "robots") {
      loadRobotsFile();
    } else if (activeTab === "sitemap") {
      generateXmlSitemap();
    }
  }, [activeTab, repo, branch]);

  const handleSaveRobots = async () => {
    setSavingRobots(true);
    setError(null);
    try {
      await commitFile(
        profile.pat,
        repo.owner,
        repo.name,
        "robots.txt",
        robotsContent,
        robotsSha,
        "seo: update robots.txt crawling configuration",
        branch
      );
      alert("Successfully published and committed robots.txt to GitHub!");
      loadRobotsFile();
    } catch (err: any) {
      setError(`Failed to save robots.txt: ${err.message}`);
    } finally {
      setSavingRobots(false);
    }
  };

  const handleSaveSitemap = async () => {
    setSavingSitemap(true);
    setError(null);
    try {
      // Look if sitemap.xml exists to get SHA (optional)
      let sitemapSha: string | undefined = undefined;
      try {
        const data = await fetchFileContent(profile.pat, repo.owner, repo.name, "sitemap.xml", branch);
        sitemapSha = data.sha;
      } catch (e) {
        // expected if new file
      }

      await commitFile(
        profile.pat,
        repo.owner,
        repo.name,
        "sitemap.xml",
        sitemapContent,
        sitemapSha,
        "seo: commit auto-generated sitemap.xml file",
        branch
      );
      alert("Successfully compiled sitemap.xml to repository root on GitHub!");
    } catch (err: any) {
      setError(`Failed to commit sitemap: ${err.message}`);
    } finally {
      setSavingSitemap(false);
    }
  };

  return (
    <div className="space-y-4 pb-24" id="seo-suite-view">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-[#e6e2d6] p-1 bg-white rounded-xl">
        <button
          onClick={() => setActiveTab("social")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "social" ? "bg-[#f0ece1] text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Share2 size={13} />
          <span>Social OG Mockups</span>
        </button>
        <button
          onClick={() => setActiveTab("robots")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "robots" ? "bg-[#f0ece1] text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <FileCode size={13} />
          <span>robots.txt</span>
        </button>
        <button
          onClick={() => setActiveTab("sitemap")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "sitemap" ? "bg-[#f0ece1] text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Globe size={13} />
          <span>sitemap.xml</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ================= SOCIAL SHARING MOCKUPS ================= */}
      {activeTab === "social" && (
        <div className="space-y-4">
          
          {/* Metadata Inputs Card */}
          <div className="bg-white border border-[#e6e2d6] rounded-2xl p-4 space-y-3.5">
            <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
              <Settings size={14} className="text-gray-400" />
              <span>Configure Metadata Parameters</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Meta Page Title</label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Meta Page Description</label>
                <textarea
                  value={ogDesc}
                  onChange={(e) => setOgDesc(e.target.value)}
                  className="w-full h-16 p-3 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-xs text-gray-900 focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">OpenGraph Image Link</label>
                <input
                  type="url"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-xs text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Facebook card preview */}
          <div className="space-y-2">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider px-1">Facebook Share Preview</span>
            <div className="bg-[#18191a] border border-[#3e4042] rounded-xl overflow-hidden shadow-md max-w-sm mx-auto">
              {/* Image preview placeholder */}
              <div className="aspect-[1.91/1] bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={ogImage}
                  alt="OG Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://github.com/identicons/git.png";
                  }}
                />
              </div>
              <div className="p-3 bg-[#242526] space-y-1 border-t border-[#3e4042]/50 text-[#b0b3b8] text-[11px] leading-tight">
                <span className="uppercase text-[9px] tracking-wide text-gray-400">
                  {profile.username.toLowerCase()}.github.io
                </span>
                <p className="font-semibold text-[#e4e6eb] text-sm truncate">{ogTitle}</p>
                <p className="line-clamp-2 text-gray-400 leading-normal">{ogDesc}</p>
              </div>
            </div>
          </div>

          {/* Twitter preview */}
          <div className="space-y-2">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider px-1">Twitter / X Card Preview</span>
            <div className="bg-black border border-[#2f3336] rounded-2xl overflow-hidden shadow-md max-w-sm mx-auto">
              <div className="aspect-[2/1] bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={ogImage}
                  alt="Twitter OG"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://github.com/identicons/git.png";
                  }}
                />
              </div>
              <div className="p-3 space-y-0.5 text-xs text-gray-400 leading-tight">
                <span className="text-[10px] text-gray-500">
                  {profile.username.toLowerCase()}.github.io
                </span>
                <p className="font-semibold text-[#e7e9ea] truncate">{ogTitle}</p>
                <p className="line-clamp-2 text-gray-500 text-[11px] leading-normal">{ogDesc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ROBOTS.TXT EDITOR ================= */}
      {activeTab === "robots" && (
        <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-gray-900">robots.txt Configuration</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Manages crawling indexing boundaries. This ensures web search engine spiders search your main directory while excluding transient files.
            </p>
          </div>

          {loadingRobots ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-gray-500">
              <RefreshCw size={24} className="animate-spin text-blue-500" />
              <p className="text-xs">Fetching robots.txt...</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              <textarea
                value={robotsContent}
                onChange={(e) => setRobotsContent(e.target.value)}
                className="w-full h-40 p-4 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-xs text-gray-900 focus:outline-none font-mono leading-relaxed resize-none"
                placeholder="User-agent: *&#10;Allow: /"
              />

              <button
                onClick={handleSaveRobots}
                disabled={savingRobots}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-gray-900 font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
              >
                {savingRobots ? "Committing update..." : "Save and publish robots.txt"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= SITEMAP GENERATOR ================= */}
      {activeTab === "sitemap" && (
        <div className="bg-white border border-[#e6e2d6] rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-gray-900">sitemap.xml Generator</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              A dynamic XML sitemap that contains every visible index, blog article, and document path in your repository.
            </p>
          </div>

          {loadingSitemap ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-gray-500">
              <RefreshCw size={24} className="animate-spin text-blue-500" />
              <p className="text-xs">Compiling files into XML nodes...</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="relative border border-[#e6e2d6] rounded-xl overflow-hidden bg-[#fdfbf7]">
                <textarea
                  readOnly
                  value={sitemapContent}
                  className="w-full h-44 p-4 bg-transparent text-gray-500 font-mono text-[10px] leading-relaxed resize-none focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={generateXmlSitemap}
                  className="flex-1 py-3 bg-[#f0ece1] border border-[#e6e2d6] rounded-xl text-xs text-gray-900 font-semibold hover:bg-[#30363d]"
                >
                  Regenerate
                </button>
                <button
                  onClick={handleSaveSitemap}
                  disabled={savingSitemap || !sitemapContent}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-505 disabled:bg-teal-800 text-gray-900 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  {savingSitemap ? "Publishing XML..." : "Publish sitemap.xml"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
