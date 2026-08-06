export interface UserProfile {
  username: string;
  avatarUrl: string;
  email?: string;
  pat: string;
  geminiKey?: string;
  cloudflareToken?: string;
}

export interface Repo {
  id: number;
  name: string;
  owner: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  description?: string;
  htmlUrl: string;
}

export interface FileNode {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: "file" | "dir";
  downloadUrl?: string;
}

export interface BlogPost {
  path: string; // File path in the repository (e.g. "blog/my-first-post.md" or "_posts/my-first-post.md")
  sha: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  category: string;
  status: "draft" | "published";
  coverImage?: string;
  content: string;
}

export interface CommitItem {
  sha: string;
  message: string;
  date: string;
  authorName: string;
  authorAvatarUrl: string;
  htmlUrl: string;
}

export interface GlobalConfig {
  logoText: string;
  authorName: string;
  authorEmail: string;
  copyrightText: string;
  customDomain?: string;
  deploymentPlatform?: "github_pages" | "cloudflare_pages" | "vercel" | "netlify";
  cloudflareDeployHookUrl?: string;
  cloudflareProjectName?: string;
  socialLinks: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    github?: string;
  };
}
