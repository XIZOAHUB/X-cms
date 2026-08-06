import { useState, useEffect } from "react";
import {
  PenTool,
  Plus,
  BookOpen,
  FileText,
  Calendar,
  Sparkles,
  ArrowLeft,
  X,
  Check,
  RefreshCw,
  FolderOpen,
  HelpCircle,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { UserProfile, Repo, BlogPost, FileNode } from "../../types/index";
import { fetchDirectory, fetchFileContent, commitFile, deleteFile, fetchAllFilesRecursive } from "../../services/githubApi";

interface BlogCMSProps {
  
  repo: Repo;
  branch: string;
}

// Frontmatter Helper Functions
export function parseMarkdown(rawContent: string): { frontmatter: any; content: string } {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, content: rawContent };
  }
  const yamlBlock = match[1];
  const bodyContent = match[2];

  const frontmatter: any = {};
  yamlBlock.split(/\r?\n/).forEach((line) => {
    const partIndex = line.indexOf(":");
    if (partIndex > -1) {
      const key = line.slice(0, partIndex).trim();
      let val = line.slice(partIndex + 1).trim();

      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }

      if (val.startsWith("[") && val.endsWith("]")) {
        frontmatter[key] = val
          .slice(1, -1)
          .split(",")
          .map((t) => t.trim().replace(/^['"]|['"]$/g, ""))
          .filter(Boolean);
      } else {
        frontmatter[key] = val;
      }
    }
  });
  return { frontmatter, content: bodyContent };
}

export function stringifyMarkdown(frontmatter: any, content: string): string {
  let yaml = "---\n";
  Object.keys(frontmatter).forEach((key) => {
    const val = frontmatter[key];
    if (Array.isArray(val)) {
      yaml += `${key}: [${val.map((v) => `'${v}'`).join(", ")}]\n`;
    } else {
      yaml += `${key}: "${String(val).replace(/"/g, '\\"')}"\n`;
    }
  });
  yaml += "---\n";
  return yaml + content;
}

export default function BlogCMS({ repo, branch }: BlogCMSProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active Editor state
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<"edit" | "preview" | "ai">("edit");
  
  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("AI");
  const [formTags, setFormTags] = useState("");
  const [formExcerpt, setFormExcerpt] = useState("");
  const [formStatus, setFormStatus] = useState<"draft" | "published">("published");
  const [formContent, setFormContent] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formPath, setFormPath] = useState("blog/my-article.md");
  const [formCoverImage, setFormCoverImage] = useState("");

  // Saving state
  const [saving, setSaving] = useState(false);

  // AI Generation State
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModelResult, setAiModelResult] = useState("");

  const loadBlogPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const allFiles = await fetchAllFilesRecursive(repo.owner, repo.name, branch);
      
      // Filter for markdown files
      const mdFiles = allFiles.filter(
        (f) => f.name.endsWith(".md") || f.name.endsWith(".markdown")
      );

      const parsedPosts: BlogPost[] = [];

      for (const file of mdFiles) {
        try {
          const fileData = await fetchFileContent(repo.owner, repo.name, file.path, branch);
          const { frontmatter, content } = parseMarkdown(fileData.content);

          // Only parse posts that look like blog entries (usually have title frontmatter)
          if (frontmatter.title) {
            parsedPosts.push({
              path: file.path,
              sha: fileData.sha,
              slug: frontmatter.slug || file.name.replace(/\.[^/.]+$/, ""),
              title: frontmatter.title || file.name,
              date: frontmatter.date || new Date().toISOString().split("T")[0],
              excerpt: frontmatter.excerpt || "",
              category: frontmatter.category || "General",
              tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
              status: frontmatter.status || "published",
              coverImage: frontmatter.coverImage || "",
              content: content,
            });
          }
        } catch (err) {
          console.warn(`Skipping parsing file ${file.path} as blog post:`, err);
        }
      }

      // Sort by date descending
      parsedPosts.sort((a, b) => b.date.localeCompare(a.date));
      setPosts(parsedPosts);
    } catch (err: any) {
      setError(err.message || "Failed to index blog posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogPosts();
  }, [repo, branch]);

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormTitle(post.title);
    setFormCategory(post.category);
    setFormTags(post.tags.join(", "));
    setFormExcerpt(post.excerpt);
    setFormStatus(post.status);
    setFormContent(post.content);
    setFormDate(post.date);
    setFormPath(post.path);
    setFormCoverImage(post.coverImage || "");
    setActiveEditorTab("edit");
  };

  const handleCreateNewPost = () => {
    const today = new Date().toISOString().split("T")[0];
    const defaultPost: BlogPost = {
      path: `_posts/${today}-new-article.md`,
      sha: "",
      slug: "new-article",
      title: "New Blog Article",
      date: today,
      excerpt: "A brief summary of what this blog post covers.",
      category: "Technology",
      tags: ["Git", "StaticWeb"],
      status: "published",
      content: "# New Article Title\n\nWrite your blog content here in markdown format.",
    };

    setEditingPost(defaultPost);
    setFormTitle(defaultPost.title);
    setFormCategory(defaultPost.category);
    setFormTags(defaultPost.tags.join(", "));
    setFormExcerpt(defaultPost.excerpt);
    setFormStatus(defaultPost.status);
    setFormContent(defaultPost.content);
    setFormDate(defaultPost.date);
    setFormPath(defaultPost.path);
    setFormCoverImage("");
    setActiveEditorTab("edit");
  };

  const handleDeletePost = async (post: BlogPost) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${post.title}"?`);
    if (!confirmDelete) return;

    setLoading(true);
    setError(null);
    try {
      await deleteFile(repo.owner, repo.name, post.path, post.sha, `delete: remove blog post ${post.title}`, branch);
      loadBlogPosts();
    } catch (err: any) {
      setError(`Failed to delete post: ${err.message}`);
      setLoading(false);
    }
  };

  const handleSavePost = async () => {
    if (!editingPost) return;
    setSaving(true);
    setError(null);

    // Format fields
    const parsedTags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    const slug = formTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const frontmatter: any = {
      title: formTitle,
      date: formDate,
      category: formCategory,
      tags: parsedTags,
      excerpt: formExcerpt,
      status: formStatus,
      slug: slug,
    };

    if (formCoverImage) {
      frontmatter.coverImage = formCoverImage;
    }

    const compiledFile = stringifyMarkdown(frontmatter, formContent);

    try {
      // If path has changed and this is an existing file, we delete the old one first!
      const pathChanged = editingPost.sha && editingPost.path !== formPath;
      if (pathChanged) {
        await deleteFile(repo.owner, repo.name, editingPost.path, editingPost.sha, `delete: clean old path for ${formTitle}`, branch);
      }

      await commitFile(
        
        repo.owner,
        repo.name,
        formPath,
        compiledFile,
        pathChanged ? undefined : editingPost.sha || undefined,
        `blog: publish post "${formTitle}"`,
        branch
      );

      setEditingPost(null);
      loadBlogPosts();
    } catch (err: any) {
      setError(`Failed to publish blog post: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ================= AI ASSISTANT FUNCTIONS =================
  const handleAiWriteDraft = async () => {
    if (!aiTopic.trim()) {
      alert("Please state what topic you want the AI to write about!");
      return;
    }

    setAiLoading(true);
    setAiModelResult("");

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are an expert copywriter. Write a comprehensive, SEO-optimized blog article about: "${aiTopic}".
          Use professional formatting, elegant headings, bullet points, and subheaders.
          Maintain an informative, friendly voice. Return strictly the raw Markdown code starting with headings.`,
          systemInstruction: "You are an expert static-website blog content generator who writes beautifully structured Markdown.",
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAiModelResult(data.text);
    } catch (err: any) {
      alert(`AI Writer Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiOptimizeSeo = async () => {
    if (!formContent.trim()) {
      alert("Please write or generate some article content first!");
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Review this blog article:
          Title: "${formTitle}"
          Content: "${formContent.slice(0, 3000)}"
          
          Generate a high-clickthrough SEO Title, a compelling Meta Excerpt summary (1-2 sentences), and 5 search tags.
          Provide the output strictly in this JSON format:
          {
            "seoTitle": "...",
            "excerpt": "...",
            "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
          }`,
          systemInstruction: "You are an SEO analyst that outputs strictly structured JSON.",
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Parse JSON
      const json = JSON.parse(data.text.replace(/```json|```/g, "").trim());
      if (json.seoTitle) setFormTitle(json.seoTitle);
      if (json.excerpt) setFormExcerpt(json.excerpt);
      if (json.tags && Array.isArray(json.tags)) setFormTags(json.tags.join(", "));

      alert("SEO suggestions generated and updated in your form fields!");
    } catch (err: any) {
      alert(`SEO Assistant Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiText = () => {
    if (aiModelResult) {
      setFormContent(aiModelResult);
      setActiveEditorTab("edit");
    }
  };

  return (
    <div className="space-y-4 pb-24" id="blog-cms-view">
      {!editingPost ? (
        /* ================= ARTICLES DIRECTORY GRID ================= */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenTool size={20} className="text-teal-400" />
              <h2 className="text-base font-semibold text-gray-900">Articles Hub</h2>
            </div>
            <button
              onClick={handleCreateNewPost}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-gray-900 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md transition-all"
            >
              <Plus size={15} />
              <span>Write Post</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-gray-500">
              <RefreshCw size={32} className="animate-spin text-teal-400" />
              <p className="text-xs">Parsing repository blog posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-[#e6e2d6] rounded-2xl p-8 text-center space-y-3">
              <BookOpen size={40} className="mx-auto text-gray-500" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900">No Blog Entries Detected</p>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  We look for `.md` or `.markdown` files containing frontmatter definitions. Create a post to get started!
                </p>
              </div>
              <button
                onClick={handleCreateNewPost}
                className="px-4 py-2 bg-[#f0ece1] border border-[#e6e2d6] rounded-xl text-xs font-semibold text-gray-900 hover:bg-[#30363d]"
              >
                Create First Post
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {posts.map((post) => (
                <div
                  key={post.path}
                  className="bg-white border border-[#e6e2d6] rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-gray-500 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
                      <span className="bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded">
                        {post.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-[#e6e2d6]/50 pt-3">
                    <div className="flex gap-1.5 overflow-x-auto py-0.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-gray-500 bg-[#f0ece1] px-1.5 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="px-3 py-1.5 bg-[#f0ece1] hover:bg-[#30363d] border border-[#e6e2d6] rounded-lg text-xs font-semibold text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePost(post)}
                        className="p-1.5 hover:bg-red-950/40 rounded-lg text-gray-500 hover:text-red-400"
                        title="Delete Article"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ================= VISUAL BLOG EDITOR PANEL ================= */
        <div className="fixed inset-0 bg-[#fdfbf7] z-50 flex flex-col font-sans overflow-hidden">
          {/* Editor Header */}
          <div className="h-16 border-b border-[#e6e2d6] bg-white px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setEditingPost(null)}
                className="p-1.5 hover:bg-[#f0ece1] rounded-lg text-gray-500 hover:text-gray-900 shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Drafting Post</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{formTitle || "Untitled"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingPost(null)}
                className="px-3.5 py-1.5 bg-[#f0ece1] hover:bg-[#30363d] border border-[#e6e2d6] rounded-lg text-xs font-medium text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePost}
                disabled={saving}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-xs font-medium text-gray-900 flex items-center gap-1 shadow-md disabled:bg-teal-800/40"
              >
                {saving ? (
                  "Publishing..."
                ) : (
                  <>
                    <Check size={14} />
                    <span>Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-[#e6e2d6] bg-white p-1 shrink-0">
            <button
              onClick={() => setActiveEditorTab("edit")}
              className={`flex-1 text-center py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeEditorTab === "edit" ? "bg-[#f0ece1] text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <PenTool size={14} />
              <span>Form Fields</span>
            </button>
            <button
              onClick={() => setActiveEditorTab("preview")}
              className={`flex-1 text-center py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeEditorTab === "preview" ? "bg-[#f0ece1] text-gray-900" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Eye size={14} />
              <span>Preview Markdown</span>
            </button>
            <button
              onClick={() => setActiveEditorTab("ai")}
              className={`flex-1 text-center py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeEditorTab === "ai" ? "bg-purple-600/10 text-purple-400 border border-purple-500/20" : "text-gray-500 hover:text-purple-400"
              }`}
            >
              <Sparkles size={14} />
              <span>AI Writing Assistant</span>
            </button>
          </div>

          {/* Editor Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300">
                {error}
              </div>
            )}

            {activeEditorTab === "edit" ? (
              /* Fields Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Save Path</label>
                    <input
                      type="text"
                      value={formPath}
                      onChange={(e) => setFormPath(e.target.value)}
                      placeholder="_posts/today-article.md"
                      className="w-full px-3 py-2 bg-white border border-[#e6e2d6] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Post Date</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#e6e2d6] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Article Title</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="E.g., 5 Simple Markdown Tips"
                    className="w-full px-3 py-2 bg-white border border-[#e6e2d6] rounded-lg text-xs text-gray-900 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#e6e2d6] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="AI">AI</option>
                      <option value="Technology">Technology</option>
                      <option value="Programming">Programming</option>
                      <option value="Tutorials">Tutorials</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Indie Hackers">Indie Hackers</option>
                      <option value="Design">Design</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Tags (comma split)</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="markdown, writing, static"
                      className="w-full px-3 py-2 bg-white border border-[#e6e2d6] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Excerpt (Summary)</label>
                  <textarea
                    value={formExcerpt}
                    onChange={(e) => setFormExcerpt(e.target.value)}
                    placeholder="1-2 sentences summarizing the article content..."
                    className="w-full h-16 p-3 bg-white border border-[#e6e2d6] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Markdown Content</label>
                    <button
                      type="button"
                      onClick={handleAiOptimizeSeo}
                      disabled={aiLoading}
                      className="text-[10px] text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles size={12} />
                      {aiLoading ? "Analyzing..." : "Auto-fill SEO Fields with AI"}
                    </button>
                  </div>
                  <div className="border border-[#e6e2d6] rounded-xl overflow-hidden bg-[#fdfbf7]">
                    <textarea
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full h-80 p-4 bg-transparent text-gray-700 placeholder-[#484f58] focus:outline-none font-mono text-xs leading-relaxed"
                      placeholder="# Heading&#10;&#10;Write here..."
                    />
                  </div>
                </div>
              </div>
            ) : activeEditorTab === "preview" ? (
              /* Preview Mode */
              <div className="space-y-4 bg-white border border-[#e6e2d6] p-5 rounded-2xl">
                <div className="space-y-2 border-b border-[#e6e2d6] pb-4">
                  <span className="text-[10px] text-teal-400 font-semibold bg-teal-500/10 px-2 py-0.5 rounded uppercase">
                    {formCategory}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">{formTitle || "Untitled Draft"}</h1>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{formDate}</span>
                  </p>
                </div>

                <div className="prose prose-invert text-xs text-gray-700 whitespace-pre-wrap leading-relaxed max-w-none">
                  {formContent || <p className="text-gray-500 italic">No content written yet.</p>}
                </div>
              </div>
            ) : (
              /* AI Writing Assistant Mode */
              <div className="space-y-4">
                <div className="bg-white border border-[#e6e2d6] rounded-2xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-purple-400 animate-pulse" size={18} />
                    <h4 className="text-xs font-semibold text-gray-900">AI Content Generation Engine</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Powered by server-side Gemini 3.5 Flash. State what topic you would like to write about, and the assistant will create a detailed, optimized article draft.
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <input
                      type="text"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="E.g., 5 best practices for designing responsive static portfolios"
                      className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-xs text-gray-900 placeholder-[#484f58] focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    onClick={handleAiWriteDraft}
                    disabled={aiLoading || !aiTopic.trim()}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-gray-900 font-semibold py-2.5 rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-2"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Writing article draft...
                      </>
                    ) : (
                      "Write Markdown Draft"
                    )}
                  </button>
                </div>

                {aiModelResult && (
                  <div className="space-y-3.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">AI Draft Outcome</span>
                      <button
                        onClick={applyAiText}
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Check size={14} />
                        <span>Inject into Editor</span>
                      </button>
                    </div>
                    <div className="border border-[#e6e2d6] rounded-xl p-4 bg-[#fdfbf7] font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed text-gray-700">
                      {aiModelResult}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
