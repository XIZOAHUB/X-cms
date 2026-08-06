import { UserProfile, Repo, FileNode, CommitItem } from "../types";

/**
 * Safely decodes a Base64 string containing UTF-8 characters.
 */
export function decodeUtf8Base64(base64Str: string): string {
  try {
    // Standard Base64 decoding with robust UTF-8 handling
    return decodeURIComponent(
      atob(base64Str.replace(/\s/g, ""))
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch (err) {
    console.error("UTF-8 Base64 decoding failed, trying standard fallback:", err);
    try {
      return atob(base64Str);
    } catch (fallbackErr) {
      throw new Error("Unable to decode file content from base64 format.");
    }
  }
}

/**
 * Encodes a string into safe UTF-8 Base64.
 */
export function encodeUtf8Base64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );
}

/**
 * Common headers helper
 */
function getHeaders(pat: string) {
  return {
    Authorization: `token ${pat}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
}

/**
 * Fetches user profile using a GitHub PAT.
 * This is used to authenticate the PAT and load profile information.
 */
export async function fetchUserProfile(pat: string): Promise<UserProfile> {
  const response = await fetch("https://api.github.com/user", {
    headers: getHeaders(pat),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid GitHub Personal Access Token. Please verify and try again.");
    }
    throw new Error(`Failed to fetch user profile (${response.status})`);
  }

  const data = await response.json();
  return {
    username: data.login,
    avatarUrl: data.avatar_url,
    email: data.email || undefined,
    pat,
  };
}

/**
 * Fetches all accessible repositories for the user.
 */
export async function fetchUserRepos(pat: string): Promise<Repo[]> {
  const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
    headers: getHeaders(pat),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch repositories list (${response.status})`);
  }

  const data = await response.json();
  return data.map((item: any) => ({
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

/**
 * Fetches list of branches in a repository.
 */
export async function fetchBranches(pat: string, owner: string, repo: string): Promise<string[]> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, {
    headers: getHeaders(pat),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch branches (${response.status})`);
  }

  const data = await response.json();
  return data.map((b: any) => b.name);
}

/**
 * Fetches directory list at a given path inside a repository.
 */
export async function fetchDirectory(
  pat: string,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<FileNode[]> {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${encodeURIComponent(
    branch
  )}`;

  const response = await fetch(url, {
    headers: getHeaders(pat),
  });

  if (response.status === 404) {
    // If folder doesn't exist, return empty array (could be new repo structure)
    return [];
  }

  if (!response.ok) {
    throw new Error(`Failed to read directory at /${cleanPath} (${response.status})`);
  }

  const data = await response.json();
  // Ensure array
  const list = Array.isArray(data) ? data : [data];

  return list.map((item: any) => ({
    name: item.name,
    path: item.path,
    sha: item.sha,
    size: item.size,
    type: item.type === "dir" ? "dir" : "file",
    downloadUrl: item.download_url || undefined,
  }));
}

/**
 * Recursively fetches ALL files in a repository pathway to support full searches
 * and "global find and replace".
 */
export async function fetchAllFilesRecursive(
  pat: string,
  owner: string,
  repo: string,
  branch: string,
  currentPath: string = ""
): Promise<FileNode[]> {
  const list = await fetchDirectory(pat, owner, repo, currentPath, branch);
  const result: FileNode[] = [];

  for (const node of list) {
    if (node.type === "file") {
      result.push(node);
    } else {
      const subFiles = await fetchAllFilesRecursive(pat, owner, repo, branch, node.path);
      result.push(...subFiles);
    }
  }

  return result;
}

/**
 * Fetches file contents and returning base64 + decoded string.
 */
export async function fetchFileContent(
  pat: string,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<{ content: string; sha: string }> {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${encodeURIComponent(
    branch
  )}`;

  const response = await fetch(url, {
    headers: getHeaders(pat),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file content for ${cleanPath} (${response.status})`);
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    throw new Error("Specified path is a directory, not a file.");
  }

  const decoded = decodeUtf8Base64(data.content);
  return {
    content: decoded,
    sha: data.sha,
  };
}

/**
 * Creates or updates a file in the repository.
 * Supports both text string content (auto UTF-8 Base64 encoded) or raw base64 (for binary files).
 */
export async function commitFile(
  pat: string,
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
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;

  const base64Content = isBase64 ? content : encodeUtf8Base64(content);

  const body: any = {
    message,
    content: base64Content,
    branch,
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: getHeaders(pat),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to commit file at ${cleanPath} (${response.status})`);
  }

  const resData = await response.json();
  return {
    sha: resData.content.sha,
  };
}

/**
 * Deletes a file from the repository.
 */
export async function deleteFile(
  pat: string,
  owner: string,
  repo: string,
  path: string,
  sha: string,
  message: string,
  branch: string
): Promise<void> {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;

  const body = {
    message,
    sha,
    branch,
  };

  const response = await fetch(url, {
    method: "DELETE",
    headers: getHeaders(pat),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Failed to delete file at ${cleanPath} (${response.status})`);
  }
}

/**
 * Fetches recent commit logs for the selected repository.
 */
export async function fetchRecentCommits(
  pat: string,
  owner: string,
  repo: string,
  branch: string
): Promise<CommitItem[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(
    branch
  )}&per_page=20`;

  const response = await fetch(url, {
    headers: getHeaders(pat),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch commits timeline (${response.status})`);
  }

  const data = await response.json();
  return data.map((item: any) => ({
    sha: item.sha,
    message: item.commit.message,
    date: item.commit.author.date,
    authorName: item.commit.author.name,
    authorAvatarUrl: item.author?.avatar_url || "https://github.com/identicons/git.png",
    htmlUrl: item.html_url,
  }));
}
