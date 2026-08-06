import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Sparkles,
  RefreshCw,
  Plus,
  X,
  Check,
  Download,
  Eye,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { UserProfile, Repo, FileNode } from "../../types/index";
import { fetchDirectory, commitFile, deleteFile, fetchAllFilesRecursive } from "../../services/githubApi";

interface MediaLibraryProps {
  
  repo: Repo;
  branch: string;
}

export default function MediaLibrary({ repo, branch }: MediaLibraryProps) {
  const [images, setImages] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [optimizeWebp, setOptimizeWebp] = useState(true);
  const [webpQuality, setWebpQuality] = useState(0.8);
  const [uploadPath, setUploadPath] = useState("assets/images");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Image details state
  const [previewImage, setPreviewImage] = useState<FileNode | null>(null);
  const [aiAltText, setAiAltText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const loadMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const allFiles = await fetchAllFilesRecursive(repo.owner, repo.name, branch);

      // Filter for common image extensions
      const imgExtensions = ["png", "jpg", "jpeg", "webp", "gif", "svg", "ico"];
      const imgFiles = allFiles.filter((f) => {
        const ext = f.name.split(".").pop()?.toLowerCase() || "";
        return imgExtensions.includes(ext);
      });

      setImages(imgFiles);
    } catch (err: any) {
      setError(err.message || "Failed to load media files from GitHub.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [repo, branch]);

  // Client-side HTML5 Canvas-based WebP Compressor
  const convertToWebpAndCompress = (file: File): Promise<{ base64: string; mimeType: string; name: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas generation failed."));
            return;
          }

          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/webp", webpQuality);
          const base64 = dataUrl.split(",")[1];
          const rawName = file.name.replace(/\.[^/.]+$/, "");
          resolve({
            base64,
            mimeType: "image/webp",
            name: `${rawName}.webp`,
          });
        };
        img.onerror = () => reject(new Error("Failed to load image file inside canvas."));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("File reader reading failed."));
      reader.readAsDataURL(file);
    });
  };

  const readAsRawBase64 = (file: File): Promise<{ base64: string; mimeType: string; name: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve({
          base64,
          mimeType: file.type,
          name: file.name,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const file = filesList[0];
    setUploading(true);
    setError(null);

    try {
      let payload: { base64: string; mimeType: string; name: string };

      const isEligibleForCompress = ["image/png", "image/jpeg", "image/jpg"].includes(file.type);

      if (optimizeWebp && isEligibleForCompress) {
        payload = await convertToWebpAndCompress(file);
      } else {
        payload = await readAsRawBase64(file);
      }

      const cleanUploadPath = uploadPath.trim().replace(/(^\/|\/$)/g, "");
      const fullPath = cleanUploadPath ? `${cleanUploadPath}/${payload.name}` : payload.name;

      // Commit to GitHub
      await commitFile(
        
        repo.owner,
        repo.name,
        fullPath,
        payload.base64,
        undefined,
        `media: upload media asset ${payload.name}`,
        branch,
        true // isBase64 = true
      );

      loadMedia();
      alert(`Successfully uploaded and committed ${payload.name} to GitHub!`);
    } catch (err: any) {
      setError(err.message || "Failed to commit image to repository.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (img: FileNode) => {
    const confirmDelete = window.confirm(`Are you absolutely sure you want to delete ${img.name}?`);
    if (!confirmDelete) return;

    setLoading(true);
    setError(null);
    try {
      await deleteFile(repo.owner, repo.name, img.path, img.sha, `media: delete asset ${img.name}`, branch);
      setPreviewImage(null);
      loadMedia();
    } catch (err: any) {
      setError(`Deletion failed: ${err.message}`);
      setLoading(false);
    }
  };

  // ================= AI IMAGE ALT TAG GENERATOR =================
  const handleGenerateAiAlt = async (img: FileNode) => {
    if (!img.downloadUrl) {
      alert("No public URL available for this file node yet.");
      return;
    }

    setAiLoading(true);
    setAiAltText("");

    try {
      // 1. Download image as base64 first so the backend can analyze it via multimodal Gemini
      const imgRes = await fetch(img.downloadUrl);
      const blob = await imgRes.blob();
      
      const base64Data: string = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(blob);
      });

      // 2. Call server-side API
      const response = await fetch("/api/gemini/generate-alt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: blob.type || "image/jpeg",
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setAiAltText(data.text);
    } catch (err: any) {
      alert(`AI Alt Text Error: ${err.message || "Ensure your Gemini API key has access."}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-24" id="media-library-view">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon size={20} className="text-blue-400" />
          <h2 className="text-base font-semibold text-gray-900">Media Assets</h2>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-gray-900 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md"
        >
          {uploading ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          <span>Upload Image</span>
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Settings Widget */}
      <div className="bg-white border border-[#e6e2d6] rounded-2xl p-4 space-y-3.5">
        <div className="flex items-center gap-2 text-xs text-gray-900 font-semibold">
          <Settings size={14} className="text-gray-400" />
          <span>Asset Upload Preferences</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-gray-500">Target Directory</label>
            <input
              type="text"
              value={uploadPath}
              onChange={(e) => setUploadPath(e.target.value)}
              className="w-full px-3 py-2 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-gray-900 focus:outline-none font-mono text-[10px]"
            />
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <label className="flex items-center gap-2 text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={optimizeWebp}
                onChange={(e) => setOptimizeWebp(e.target.checked)}
                className="rounded border-[#e6e2d6] text-blue-500 focus:ring-blue-500 bg-[#fdfbf7]"
              />
              <span>Convert to WebP</span>
            </label>
            {optimizeWebp && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-[10px]">Quality:</span>
                <input
                  type="range"
                  min="0.4"
                  max="0.95"
                  step="0.05"
                  value={webpQuality}
                  onChange={(e) => setWebpQuality(Number(e.target.value))}
                  className="w-20 accent-blue-500 h-1 bg-slate-800 rounded"
                />
                <span className="text-gray-900 text-[10px]">{Math.round(webpQuality * 100)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3 text-gray-500">
          <RefreshCw size={32} className="animate-spin text-blue-500" />
          <p className="text-xs">Scanning media files recursively...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white border border-[#e6e2d6] rounded-2xl py-12 text-center text-xs text-gray-500">
          No images or logos detected in the repository yet. Upload an asset to begin.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {images.map((img) => (
            <div
              key={img.path}
              className="bg-white border border-[#e6e2d6] rounded-2xl overflow-hidden group cursor-pointer hover:border-gray-500 transition-colors"
              onClick={() => {
                setPreviewImage(img);
                setAiAltText("");
              }}
            >
              <div className="aspect-square bg-slate-900 flex items-center justify-center relative overflow-hidden">
                {img.downloadUrl ? (
                  <img
                    src={img.downloadUrl}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ImageIcon size={28} className="text-gray-500" />
                )}
              </div>
              <div className="p-2.5 space-y-0.5">
                <p className="text-xs font-bold text-gray-900 truncate">{img.name}</p>
                <p className="text-[10px] text-gray-500 font-mono truncate">{img.path}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= IMAGE DETAIL PREVIEW MODAL ================= */}
      {previewImage && (
        <div className="fixed inset-0 bg-[#000000]/90 z-50 flex flex-col font-sans overflow-hidden">
          {/* Header */}
          <div className="h-16 border-b border-[#e6e2d6] bg-white px-4 flex items-center justify-between shrink-0">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 truncate">Asset Details</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{previewImage.name}</p>
            </div>
            <button
              onClick={() => setPreviewImage(null)}
              className="p-1.5 hover:bg-[#f0ece1] rounded-lg text-gray-500 hover:text-gray-900"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div className="max-w-md mx-auto space-y-5">
              {/* Massive Centered Image */}
              <div className="bg-white border border-[#e6e2d6] rounded-2xl p-4 flex items-center justify-center min-h-[250px]">
                {previewImage.downloadUrl ? (
                  <img
                    src={previewImage.downloadUrl}
                    alt={previewImage.name}
                    className="max-h-80 object-contain rounded-lg max-w-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <ImageIcon size={48} className="text-gray-600 animate-pulse" />
                )}
              </div>

              {/* Stats & Info Table */}
              <div className="bg-white border border-[#e6e2d6] rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[#e6e2d6]/50">
                  <span className="text-gray-500">Path</span>
                  <span className="font-mono text-gray-900 text-[11px] truncate max-w-[250px]">{previewImage.path}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#e6e2d6]/50">
                  <span className="text-gray-500">Size</span>
                  <span className="text-gray-900 font-medium">{Math.round(previewImage.size / 1024 * 10) / 10} KB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">SHA-Hash</span>
                  <span className="font-mono text-gray-400 text-[10px] truncate max-w-[200px]">{previewImage.sha}</span>
                </div>
              </div>

              {/* AI Alt Tag Generator Card */}
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-purple-400" size={16} />
                    <h4 className="text-xs font-semibold text-purple-300">AI Alt-Text Descriptor</h4>
                  </div>
                  <button
                    onClick={() => handleGenerateAiAlt(previewImage)}
                    disabled={aiLoading}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-gray-900 rounded-lg text-[10px] font-semibold flex items-center gap-1"
                  >
                    {aiLoading ? (
                      <RefreshCw size={10} className="animate-spin" />
                    ) : (
                      <Sparkles size={10} />
                    )}
                    <span>Generate Alt Text</span>
                  </button>
                </div>

                {aiAltText ? (
                  <div className="p-3 bg-[#fdfbf7] border border-[#e6e2d6] rounded-xl text-xs text-gray-900 leading-relaxed">
                    <p className="font-medium text-purple-300 mb-1 font-mono text-[10px] uppercase">SEO Alt Tag Description:</p>
                    <p>{aiAltText}</p>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Click generate to analyze this image using Gemini and produce SEO alt-text descriptions.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                {previewImage.downloadUrl && (
                  <a
                    href={previewImage.downloadUrl}
                    download={previewImage.name}
                    className="flex-1 py-3 bg-[#f0ece1] border border-[#e6e2d6] rounded-xl text-xs text-gray-900 font-semibold hover:bg-[#30363d] text-center flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Download Raw</span>
                  </a>
                )}
                <button
                  onClick={() => handleDeleteImage(previewImage)}
                  className="flex-1 py-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300 font-semibold hover:bg-red-900/20 flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Delete Asset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
