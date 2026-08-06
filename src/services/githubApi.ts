import { UserProfile, Repo, FileNode, CommitItem } from "../types";
import { apiClient } from "./apiClient";

export function decodeUtf8Base64(base64Str: string): string {
  try {
    return decodeURIComponent(
      atob(base64Str.replace(/\s/g, ""))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch (err) {
    try {
      return atob(base64Str);
    } catch (fallbackErr) {
      throw new Error("Unable to decode file content from base64 format.");
    }
  }
}

export function encodeUtf8Base64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

export async function fetchUserRepos(): Promise<Repo[]> {
  const response = await apiClient.get("/github/user/repos?per_page=100&sort=updated");
  return response.data.map((item: any) => ({
    id: item.id,
    name: item.name,
    owner: item.owner.login,
    fullName: item.full_name,
    private: item.private,
    defaultBranch: item.default_branch || "main",
    description: item.description || undefined,
    htmlUrl: item.html_url,
  }));
}

export async function fetchBranches(owner: string, repo: string): Promise<string[]> {
  const response = await apiClient.get(`/github/repos/${owner}/${repo}/branches?per_page=100`);
  return response.data.map((b: any) => b.name);
}

export async function fetchDirectory(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<FileNode[]> {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  try {
    const response = await apiClient.get(
      `/github/repos/${owner}/${repo}/contents/${cleanPath}?ref=${encodeURIComponent(branch)}`
    );
    const data = response.data;
    const list = Array.isArray(data) ? data : [data];
    return list.map((item: any) => ({
      name: item.name,
      path: item.path,
      sha: item.sha,
      size: item.size,
      type: item.type === "dir" ? "dir" : "file",
      downloadUrl: item.download_url || undefined,
    }));
  } catch (err: any) {
    if (err.response?.status === 404) return [];
    throw err;
  }
}

export async function fetchAllFilesRecursive(
  owner: string,
  repo: string,
  branch: string,
  currentPath: string = ""
): Promise<FileNode[]> {
  const list = await fetchDirectory(owner, repo, currentPath, branch);
  const result: FileNode[] = [];
  for (const node of list) {
    if (node.type === "file") {
      result.push(node);
    } else {
      const subFiles = await fetchAllFilesRecursive(owner, repo, branch, node.path);
      result.push(...subFiles);
    }
  }
  return result;
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<{ content: string; sha: string }> {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const response = await apiClient.get(
    `/github/repos/${owner}/${repo}/contents/${cleanPath}?ref=${encodeURIComponent(branch)}`
  );
  const data = response.data;
  if (Array.isArray(data)) throw new Error("Specified path is a directory, not a file.");
  return {
    content: decodeUtf8Base64(data.content),
    sha: data.sha,
  };
}

export async function commitFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  sha: string | undefined,
  message: string,
  branch: string,
  isBase64: boolean = false
): Promise<{ sha: string }> {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const base64Content = isBase64 ? content : encodeUtf8Base64(content);
  const body: any = { message, content: base64Content, branch };
  if (sha) body.sha = sha;
  
  const response = await apiClient.put(`/github/repos/${owner}/${repo}/contents/${cleanPath}`, body);
  return { sha: response.data.content.sha };
}

export async function deleteFile(
  owner: string,
  repo: string,
  path: string,
  sha: string,
  message: string,
  branch: string
): Promise<void> {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const body = { message, sha, branch };
  await apiClient.delete(`/github/repos/${owner}/${repo}/contents/${cleanPath}`, { data: body });
}

export async function fetchRecentCommits(
  owner: string,
  repo: string,
  branch: string
): Promise<CommitItem[]> {
  const response = await apiClient.get(
    `/github/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=20`
  );
  return response.data.map((item: any) => ({
    sha: item.sha,
    message: item.commit.message,
    date: item.commit.author.date,
    authorName: item.commit.author.name,
    authorAvatarUrl: item.author?.avatar_url || "https://github.com/identicons/git.png",
    htmlUrl: item.html_url,
  }));
}
