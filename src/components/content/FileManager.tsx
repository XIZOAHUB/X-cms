import React, { useState, useEffect } from "react";
import {
  Folder,
  File,
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  FolderPlus,
  FilePlus,
  X,
  Check,
  AlertTriangle,
  Settings,
  CornerDownRight,
} from "lucide-react";
import { UserProfile, Repo, FileNode } from "../../types/index";
import { fetchDirectory, fetchFileContent, commitFile, deleteFile, fetchAllFilesRecursive } from "../../services/githubApi";

interface FileManagerProps {
  
  repo: Repo;
  branch: string;
}

export default function FileManager({ repo, branch }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals / Creation states
  const [showCreateModal, setShowCreateModal] = useState<"file" | "dir" | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [creating, setCreating] = useState(false);

  // File Editor state
  const [editingFile, setEditingFile] = useState<FileNode | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [editorSubTab, setEditorSubTab] = useState<"edit" | "diff" | "preview">("edit");
  const [editorSha, setEditorSha] = useState("");
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorCommitMsg, setEditorCommitMsg] = useState("");
  const [savingFile, setSavingFile] = useState(false);

  // Global Find and Replace State
  const [activeTab, setActiveTab] = useState<"browse" | "replace">("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [replaceExtensions, setReplaceExtensions] = useState(".html, .md");
  const [replaceLoading, setReplaceLoading] = useState(false);
  const [replaceResults, setReplaceResults] = useState<{ path: string; sha: string; originalContent: string; matchesCount: number; checked: boolean }[]>([]);
  const [replaceStatus, setReplaceStatus] = useState<string | null>(null);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchDirectory(repo.owner, repo.name, path, branch);
      // Sort: folders first, then files upadte 
      const sorted = [...list].sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "dir" ? -1 : 1;
      });
      setFiles(sorted);
      setCurrentPath(path);
    } catch (err: any) {
      setError(err.message || "Failed to load files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory(currentPath);
  }, [repo, branch]);

  const handleFolderClick = (path: string) => {
    loadDirectory(path);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      loadDirectory("");
      return;
    }
    const parts = currentPath.split("/");
    const targetPath = parts.slice(0, index + 1).join("/");
    loadDirectory(targetPath);
  };

  const handleOpenFile = async (file: FileNode) => {
    setEditingFile(file);
    setEditorContent("");
    setOriginalContent("");
    setEditorSubTab("edit");
    setEditorSha("");
    setEditorLoading(true);
    setEditorCommitMsg(`update: edit ${file.name}`);
    setError(null);

    try {
      const data = await fetchFileContent(repo.owner, repo.name, file.path, branch);
      setEditorContent(data.content);
      setOriginalContent(data.content);
      setEditorSha(data.sha);
    } catch (err: any) {
      setError(`Failed to read file: ${err.message}`);
      setEditingFile(null);
    } finally {
      setEditorLoading(false);
    }
  };

  const handleSaveFile = async () => {
    if (!editingFile) return;
    setSavingFile(true);
    setError(null);

    try {
      const message = editorCommitMsg.trim() || `update: modify ${editingFile.name}`;
      await commitFile(repo.owner, repo.name, editingFile.path, editorContent, editorSha, message, branch);
      setEditingFile(null);
      loadDirectory(currentPath);
    } catch (err: any) {
      setError(`Failed to save file: ${err.message}`);
    } finally {
      setSavingFile(false);
    }
  };

  const handleDeleteFile = async (file: FileNode) => {
    const confirmed = window.confirm(`Are you absolutely sure you want to delete /${file.path}?`);
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      await deleteFile(repo.owner, repo.name, file.path, file.sha, `delete: remove ${file.name}`, branch);
      loadDirectory(currentPath);
    } catch (err: any) {
      setError(`Failed to delete: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!newItemName.trim() || !showCreateModal) return;
    setCreating(true);
    setError(null);

    const safeName = newItemName.trim();
    const cleanPath = currentPath ? `${currentPath}/${safeName}` : safeName;

    try {
      if (showCreateModal === "file") {
        // Create an empty markdown or text file
        await commitFile(
          
          repo.owner,
          repo.name,
          cleanPath,
          `# ${safeName.split(".")[0]}\n\nCreated with AuroraCMS on ${new Date().toLocaleDateString()}`,
          undefined,
          `feat: create file ${safeName}`,
          branch
        );
      } else {
        // GitHub API has no direct 'empty folder' creation concept since Git is file-only.
        // We bypass this by placing a hidden placeholder `.gitkeep` file inside! This is clean and professional!
        const keepFilePath = `${cleanPath}/.gitkeep`;
        await commitFile(
          
          repo.owner,
          repo.name,
          keepFilePath,
          "# Placeholder for folder generation",
          undefined,
          `feat: build directory ${safeName}`,
          branch
        );
      }
      setShowCreateModal(null);
      setNewItemName("");
      loadDirectory(currentPath);
    } catch (err: any) {
      setError(err.message || "Failed to create item.");
    } finally {
      setCreating(false);
    }
  };

  // Global Find and Replace Algorithm
  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) {
      alert("Please enter a valid search string.");
      return;
    }

    setReplaceLoading(true);
    setReplaceResults([]);
    setReplaceStatus(null);
    setError(null);

    try {
      const allFiles = await fetchAllFilesRecursive(repo.owner, repo.name, branch);
      
      const exts = replaceExtensions
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e);

      // Filter based on extension list (e.g. .html, .md)
      const matchingFiles = allFiles.filter((f) => {
        const fileExt = `.${f.name.split(".").pop()?.toLowerCase() || ""}`;
        return exts.some((ext) => fileExt === ext);
      });

      const matchedResults: typeof replaceResults = [];

      // Download content for files to check if they contain the search term
      for (const file of matchingFiles) {
        try {
          const fileData = await fetchFileContent(repo.owner, repo.name, file.path, branch);
          if (fileData.content.includes(searchQuery)) {
            // Count occurrences
            const regex = new RegExp(searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
            const count = (fileData.content.match(regex) || []).length;
            matchedResults.push({
              path: file.path,
              sha: fileData.sha,
              originalContent: fileData.content,
              matchesCount: count,
              checked: true,
            });
          }
        } catch (fileErr) {
          console.warn(`Could not read file ${file.path} for search index:`, fileErr);
        }
      }

      setReplaceResults(matchedResults);
      setReplaceStatus(`Search complete. Found ${matchedResults.length} files matching "${searchQuery}".`);
    } catch (err: any) {
      setError(err.message || "Global search failed.");
    } finally {
      setReplaceLoading(false);
    }
  };

  const handleGlobalReplace = async () => {
    const checkedItems = replaceResults.filter((r) => r.checked);
    if (checkedItems.length === 0) {
      alert("No files selected for replacement.");
      return;
    }

    const confirmRun = window.confirm(
      `Are you sure you want to replace "${searchQuery}" with "${replaceQuery}" in ${checkedItems.length} files? This commits updates directly to GitHub.`
    );
    if (!confirmRun) return;

    setReplaceLoading(true);
    setReplaceStatus("Replacing occurrences and committing updates...");
    setError(null);

    let successCount = 0;

    try {
      for (const item of checkedItems) {
        const regex = new RegExp(searchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
        const replacedContent = item.originalContent.replace(regex, replaceQuery);

        await commitFile(
          
          repo.owner,
          repo.name,
          item.path,
          replacedContent,
          item.sha,
          `refactor: globally replace '${searchQuery}' with '${replaceQuery}'`,
          branch
        );
        successCount++;
      }

      setReplaceResults([]);
      setSearchQuery("");
      setReplaceQuery("");
      setReplaceStatus(`Successfully updated ${successCount} files on GitHub!`);
      loadDirectory(currentPath);
    } catch (err: any) {
      setError(`Global replacement failed: ${err.message}`);
    } finally {
      setReplaceLoading(false);
    }
  };

  const toggleCheckResult = (index: number) => {
    const updated = [...replaceResults];
    updated[index].checked = !updated[index].checked;
    setReplaceResults(updated);
  };

  return (
    <div className="space-y-4 pb-24" id="file-manager-view">
      {/* File Manager Segment Selector */}
      <div className="flex border-b border-[#e6e2d6] p-1 bg-white rounded-xl">
        <button
          onClick={() => setActiveTab("browse")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "browse" ? "bg-[#f0ece1] text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Browse Files
        </button>
        <button
          onClick={() => setActiveTab("replace")}
          className={`flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === "replace" ? "bg-[#f0ece1] text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Global Find & Replace
        </button>
      </div>

      {activeTab === "browse" ? (
        /* ================= BROWSE DIRECTORY VIEW ================= */
        <div className="space-y-4">
          {/* Breadcrumbs Navigation */}
          <div className="bg-white border border-[#e6e2d6] rounded-xl px-4 py-3 flex items-center gap-1.5 overflow-x-auto text-xs whitespace-nowrap">
            <button
              onClick={() => handleBreadcrumbClick(-1)}
              className="text-blue-400 font-semibold hover:underline"
            >
              root
            </button>
            {currentPath.split("/").filter((p) => p).map((part, index) => (
              <span key={index} className="flex items-center gap-1.5">
                <ChevronRight size={12} className="text-gray-500" />
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className="text-blue-400 font-semibold hover:underline"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>

          {/* Action Header controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadDirectory(currentPath)}
                className="p-2 bg-[#f0ece1] border border-[#e6e2d6] rounded-xl text-gray-700 hover:text-gray-900 transition-colors"
                title="Refresh directory"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              {currentPath && (
                <button
                  onClick={() => {
                    const parts = currentPath.split("/");
                    const parent = parts.slice(0, -1).join("/");
                    loadDirectory(parent);
                  }}
                  className="p-2 bg-[#f0ece1] border border-[#e6e2d6] rounded-xl text-gray-900 flex items-center gap-1 text-xs font-medium"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateModal("dir")}
                className="px-3 py-2 bg-[#f0ece1] border border-[#e6e2d6] rounded-xl text-xs font-medium text-gray-700 hover:bg-[#30363d] transition-colors flex items-center gap-1"
              >
                <FolderPlus size={14} />
                <span>New Folder</span>
              </button>
              <button
                onClick={() => setShowCreateModal("file")}
                className="px-3 py-2 bg-blue-600 rounded-xl text-xs font-medium text-gray-900 hover:bg-blue-500 transition-colors flex items-center gap-1 shadow-md"
              >
                <FilePlus size={14} />
                <span>New File</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* File Grid / Directory list */}
          <div className="bg-white border border-[#e6e2d6] rounded-2xl overflow-hidden">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-gray-500">
                <RefreshCw size={32} className="animate-spin text-blue-500" />
                <p className="text-xs">Reading GitHub files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-500">
                Empty folder or new repository structure. Place files here to get started.
              </div>
            ) : (
              <div className="divide-y divide-[#30363d]">
                {files.map((file) => (
                  <div
                    key={file.path}
                    className="flex items-center justify-between p-4 hover:bg-[#f0ece1]/50 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() =>
                        file.type === "dir" ? handleFolderClick(file.path) : handleOpenFile(file)
                      }
                    >
                      {file.type === "dir" ? (
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                          <Folder size={18} />
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-[#f0ece1] text-gray-500">
                          <File size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-500">
                          {file.type === "dir" ? "Directory" : `${Math.round(file.size / 1024 * 10) / 10} KB`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 pl-4">
                      {file.type === "file" && (
                        <button
                          onClick={() => handleOpenFile(file)}
                          className="p-1.5 hover:bg-[#30363d] rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                          title="Edit File"
                        >
                          <Edit3 size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFile(file)}
                        className="p-1.5 hover:bg-red-950/40 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete Asset"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= GLOBAL FIND AND REPLACE VIEW ================= */
        <div className="space-y-4 bg-white border border-[#e6e2d6] rounded-2xl p-5 shadow-lg">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">Global Find and Replace</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Updates occur directly across multiple folders in your repository. This downloads file matching extensions, reviews text patterns, and submits structural edits with atomic commits.
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-500 font-medium">File Extensions Filter</label>
              <input
                type="text"
                value={replaceExtensions}
                onChange={(e) => setReplaceExtensions(e.target.value)}
                placeholder=".html, .md, .json"
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">Search for text</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="old-email@site.com"
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 font-medium">Replace with</label>
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder="new-email@site.com"
                  className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleGlobalSearch}
              disabled={replaceLoading || !searchQuery.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 disabled:text-gray-500 text-gray-900 font-medium py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-xs"
            >
              {replaceLoading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Processing search scans...
                </>
              ) : (
                "Scan Repo Files"
              )}
            </button>
          </div>

          {replaceStatus && (
            <p className="text-xs text-gray-500 bg-[#fdfbf7] p-2.5 border border-[#e6e2d6] rounded-lg">
              {replaceStatus}
            </p>
          )}

          {replaceResults.length > 0 && (
            <div className="space-y-3.5 pt-3 border-t border-[#e6e2d6]/50">
              <p className="text-xs font-semibold text-gray-900">Matching Files Found:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {replaceResults.map((result, idx) => (
                  <div
                    key={result.path}
                    className="flex items-start gap-2.5 p-3 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={result.checked}
                      onChange={() => toggleCheckResult(idx)}
                      className="mt-0.5 rounded border-[#e6e2d6] text-blue-500 focus:ring-blue-500 bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{result.path}</p>
                      <div className="flex items-center gap-1.5 text-amber-400 mt-1">
                        <CornerDownRight size={12} />
                        <span>{result.matchesCount} pattern matches found</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleGlobalReplace}
                disabled={replaceLoading}
                className="w-full bg-teal-600 hover:bg-teal-500 text-gray-900 font-medium py-3 rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-2"
              >
                {replaceLoading ? "Executing replaces..." : `Replace Selected (${replaceResults.filter(r => r.checked).length} files)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= NEW FILE / DIR MODAL DIALOG ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#000000]/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e6e2d6] rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">
                Create New {showCreateModal === "file" ? "File" : "Folder"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(null);
                  setNewItemName("");
                }}
                className="p-1 hover:bg-[#30363d] rounded-lg text-gray-500 hover:text-gray-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Current Location: <span className="font-mono text-gray-900">/{currentPath || "root"}</span>
              </p>
              <input
                type="text"
                placeholder={showCreateModal === "file" ? "post.md, style.css" : "blog, assets/js"}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            </div>

            <div className="flex gap-2.5 justify-end pt-2">
              <button
                onClick={() => {
                  setShowCreateModal(null);
                  setNewItemName("");
                }}
                className="px-4 py-2 bg-[#f0ece1] border border-[#e6e2d6] rounded-xl text-xs font-medium text-gray-900 hover:bg-[#30363d]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateItem}
                disabled={creating || !newItemName.trim()}
                className="px-4 py-2 bg-blue-600 rounded-xl text-xs font-medium text-gray-900 hover:bg-blue-505 disabled:bg-blue-800/40"
              >
                {creating ? "Creating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FULLSCREEN FILE EDITOR ================= */}
      {editingFile && (
        <div className="fixed inset-0 bg-[#fdfbf7] z-50 flex flex-col font-sans">
          {/* Header */}
          <div className="h-16 border-b border-[#e6e2d6] bg-white px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setEditingFile(null)}
                className="p-1.5 hover:bg-[#f0ece1] rounded-lg text-gray-500 hover:text-gray-900 shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">Editing File</p>
                <p className="text-sm font-semibold text-gray-900 truncate">/{editingFile.path}</p>
              </div>
            </div>

            {/* View Sub-tabs Selector */}
            <div className="flex bg-[#fdfbf7] border border-[#e6e2d6] p-0.5 rounded-lg text-xs">
              {(["edit", "diff", "preview"] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setEditorSubTab(sub)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all uppercase text-[10px] tracking-wider ${
                    editorSubTab === sub
                      ? "bg-[#f0ece1] text-[#58a6ff] border border-[#e6e2d6]"
                      : "text-gray-500 hover:text-gray-900 border border-transparent"
                  }`}
                >
                  {sub === "edit" ? "Code Editor" : sub === "diff" ? "Git Diff" : "Live Preview"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingFile(null)}
                className="px-3.5 py-1.5 bg-[#f0ece1] hover:bg-[#30363d] border border-[#e6e2d6] rounded-lg text-xs font-medium text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFile}
                disabled={savingFile || editorLoading}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-medium text-gray-900 flex items-center gap-1 shadow-md disabled:bg-blue-800/40"
              >
                {savingFile ? (
                  "Saving..."
                ) : (
                  <>
                    <Check size={14} />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor Container */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {editorLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-gray-500">
                <RefreshCw size={24} className="animate-spin text-blue-500" />
                <p className="text-xs">Downloading raw asset content...</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col p-4 space-y-3 overflow-hidden">
                {editorSubTab === "edit" && (
                  <div className="flex-1 overflow-hidden border border-[#e6e2d6] rounded-xl bg-[#fdfbf7] flex flex-col">
                    <div className="bg-white px-4 py-1.5 border-b border-[#e6e2d6] flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <span>AUTO SAVE READY</span>
                      <span>UTF-8 • UNIX</span>
                    </div>
                    <textarea
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      className="flex-1 w-full p-4 bg-transparent text-gray-700 placeholder-[#484f58] focus:outline-none resize-none font-mono text-xs leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                )}

                {editorSubTab === "diff" && (
                  <div className="flex-1 overflow-hidden flex flex-col bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl">
                    <div className="bg-white px-4 py-1.5 border-b border-[#e6e2d6] flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <span>GIT COMMIT CHANGES DIFF</span>
                      <span className="text-amber-400">Comparing original vs modified</span>
                    </div>
                    <div className="flex-1 overflow-y-auto font-mono text-[11px] p-2 space-y-0.5">
                      {(() => {
                        const originalLines = originalContent.split("\n");
                        const modifiedLines = editorContent.split("\n");
                        const maxLines = Math.max(originalLines.length, modifiedLines.length);
                        const diffLines: React.ReactNode[] = [];

                        for (let i = 0; i < maxLines; i++) {
                          const orig = originalLines[i];
                          const mod = modifiedLines[i];

                          if (orig === mod) {
                            diffLines.push(
                              <div key={i} className="flex hover:bg-white/35 py-0.5">
                                <span className="w-10 text-right pr-2 text-gray-600 select-none mr-2 border-r border-[#e6e2d6]/30 text-[10px]">{i + 1}</span>
                                <span className="text-gray-400 whitespace-pre">{orig}</span>
                              </div>
                            );
                          } else {
                            if (orig !== undefined) {
                              diffLines.push(
                                <div key={`del-${i}`} className="flex bg-red-950/20 py-0.5">
                                  <span className="w-10 text-right pr-2 text-red-500/50 select-none mr-2 border-r border-red-900/30 text-[10px]">{i + 1}</span>
                                  <span className="text-red-400 font-semibold whitespace-pre">- {orig}</span>
                                </div>
                              );
                            }
                            if (mod !== undefined) {
                              diffLines.push(
                                <div key={`add-${i}`} className="flex bg-emerald-950/20 py-0.5">
                                  <span className="w-10 text-right pr-2 text-emerald-500/50 select-none mr-2 border-r border-emerald-900/30 text-[10px]">{i + 1}</span>
                                  <span className="text-[#3fb950] font-semibold whitespace-pre">+ {mod}</span>
                                </div>
                              );
                            }
                          }
                        }
                        return diffLines;
                      })()}
                    </div>
                  </div>
                )}

                {editorSubTab === "preview" && (
                  <div className="flex-1 overflow-hidden border border-[#e6e2d6] rounded-xl bg-white flex flex-col">
                    <div className="bg-white px-4 py-1.5 border-b border-[#e6e2d6] flex items-center justify-between text-[11px] text-gray-400 font-mono">
                      <span>LIVE RENDERING FRAMEWORK</span>
                      <span>SANDBOXED</span>
                    </div>
                    {editingFile.name.endsWith(".html") ? (
                      <iframe
                        srcDoc={editorContent}
                        title="Live HTML Preview"
                        className="flex-1 w-full bg-white"
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="flex-1 overflow-y-auto p-6 bg-[#fdfbf7] text-gray-700 markdown-body">
                        {editorContent.split("\n").map((line, idx) => {
                          if (line.startsWith("# ")) {
                            return <h1 key={idx} className="text-2xl font-bold text-gray-900 border-b border-[#e6e2d6] pb-2 my-4">{line.replace("# ", "")}</h1>;
                          }
                          if (line.startsWith("## ")) {
                            return <h2 key={idx} className="text-xl font-bold text-gray-900 my-3">{line.replace("## ", "")}</h2>;
                          }
                          if (line.startsWith("### ")) {
                            return <h3 key={idx} className="text-lg font-bold text-gray-900 my-2">{line.replace("### ", "")}</h3>;
                          }
                          if (line.startsWith("- ") || line.startsWith("* ")) {
                            return <li key={idx} className="text-xs text-gray-300 list-disc ml-5 my-1">{line.slice(2)}</li>;
                          }
                          return <p key={idx} className="text-xs text-gray-300 my-2 leading-relaxed">{line}</p>;
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Commit Message Box */}
                <div className="space-y-1 shrink-0">
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Commit Message</label>
                  <input
                    type="text"
                    value={editorCommitMsg}
                    onChange={(e) => setEditorCommitMsg(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#e6e2d6] rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Commit message (e.g., fix: amend spelling typo)"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
