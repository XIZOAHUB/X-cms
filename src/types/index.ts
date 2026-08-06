export interface UserProfile {
  username: string;
  avatarUrl: string;
  email?: string;
  // No PAT or Cloudflare tokens stored on the client!
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
  path: string;
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
  socialLinks: {
    youtube?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    github?: string;
  };
}
