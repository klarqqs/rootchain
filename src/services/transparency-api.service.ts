import { apiRequest } from "@/lib/api/http-client";

export interface PlatformActivity {
  id: string;
  type: string;
  title: string;
  summary: string;
  projectId: string | null;
  projectTitle?: string;
  actorName?: string;
  createdAt: string;
}

export async function fetchPlatformActivity(limit = 40, projectId?: string) {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (projectId) qs.set("projectId", projectId);
  const data = await apiRequest<{ activities: PlatformActivity[] }>(
    `/transparency/activity?${qs}`,
    {},
    { auth: false },
  );
  return data.activities;
}
