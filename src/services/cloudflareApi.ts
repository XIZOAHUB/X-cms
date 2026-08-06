import { apiClient } from "./apiClient";

export interface CloudflareProject {
  id: string;
  name: string;
  subdomain: string;
  domains: string[];
  source?: {
    type: string;
    config?: {
      owner: string;
      repo_name: string;
    };
  };
  latest_deployment?: CloudflareDeployment;
}

export interface CloudflareDeployment {
  id: string;
  environment: string;
  status: "success" | "failure" | "active" | "canceled";
  url: string;
  created_on: string;
  modified_on: string;
  latest_stage?: {
    name: string;
    started_on: string;
    ended_on: string;
    status: string;
  };
}

export interface CloudflareDomain {
  id: string;
  name: string;
  status: string;
}

export async function fetchPagesProjects(): Promise<CloudflareProject[]> {
  const response = await apiClient.get(`/cloudflare/pages/projects`);
  return response.data.result;
}

export async function fetchProjectDomains(projectName: string): Promise<CloudflareDomain[]> {
  try {
    const response = await apiClient.get(`/cloudflare/pages/projects/${projectName}/domains`);
    return response.data.result;
  } catch (err) {
    return [];
  }
}

export async function fetchDeployments(projectName: string): Promise<CloudflareDeployment[]> {
  const response = await apiClient.get(`/cloudflare/pages/projects/${projectName}/deployments`);
  return response.data.result;
}

export async function triggerDeployment(projectName: string): Promise<CloudflareDeployment> {
  const response = await apiClient.post(`/cloudflare/pages/projects/${projectName}/deployments`);
  return response.data.result;
}
