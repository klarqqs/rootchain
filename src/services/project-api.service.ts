import { apiRequest } from "@/lib/api/http-client";

export interface ProjectMediaInput {
  url: string;
  kind?: "IMAGE" | "VIDEO";
  caption?: string;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  cropType: string;
  location: string;
  targetAmount: number;
  expectedRoiPct: number;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  aiScore?: number;
  harvestTimeline?: string;
  startDate: string;
  endDate: string;
  farmId?: string;
  media?: ProjectMediaInput[];
}

export interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  cropType: string;
  location: string;
  targetAmount: number;
  raisedAmount: number;
  expectedRoiPct: number;
  riskLevel: string;
  aiScore: number | null;
  harvestTimeline: string | null;
  status: string;
  fundingProgressPct: number;
  media: { id: string; kind: string; url: string; caption: string | null }[];
  updates?: ProjectUpdate[];
}

export interface ProjectUpdate {
  id: string;
  updateType: string;
  title: string | null;
  body: string;
  mediaUrl: string | null;
  authorName?: string;
  createdAt: string;
}

export async function createProject(input: CreateProjectInput) {
  const data = await apiRequest<{ project: ProjectDetail }>("/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.project;
}

export async function submitProject(projectId: string) {
  const data = await apiRequest<{ project: ProjectDetail }>(`/projects/${projectId}/submit`, {
    method: "POST",
  });
  return data.project;
}

export async function listMyProjects() {
  const data = await apiRequest<{ projects: ProjectDetail[] }>("/projects/mine");
  return data.projects;
}

export async function fetchProject(projectId: string) {
  const data = await apiRequest<{ project: ProjectDetail | null }>(`/projects/${projectId}`, {}, {
    auth: false,
  });
  return data.project;
}

export async function postProjectUpdate(
  projectId: string,
  input: {
    title?: string;
    body: string;
    updateType?: "GENERAL" | "MILESTONE" | "HARVEST";
    mediaUrl?: string;
  },
) {
  const data = await apiRequest<{ update: ProjectUpdate }>(`/updates/project/${projectId}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.update;
}

export async function fetchProjectUpdates(projectId: string) {
  const data = await apiRequest<{ updates: ProjectUpdate[] }>(
    `/updates/project/${projectId}`,
    {},
    { auth: false },
  );
  return data.updates;
}

export async function fetchProjectTransactions(projectId: string) {
  const data = await apiRequest<{
    transactions: {
      id: string;
      investor: { id: string; name: string; emailMasked: string };
      amount: number;
      stellarTxHash: string | null;
      status: string;
      timestamp: string;
    }[];
  }>(`/transactions/project/${projectId}`, {}, { auth: false });
  return data.transactions;
}
