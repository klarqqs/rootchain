import { apiRequest } from "@/lib/api/http-client";

export type AdminReviewDecision = "APPROVED" | "REJECTED";

export async function fetchPendingFarmers() {
  return apiRequest<{
    farmers: {
      id: string;
      displayName: string;
      verificationStatus: string;
      user: { email: string; fullName: string | null };
    }[];
  }>("/admin/farmers/pending");
}

export async function fetchPendingProjects() {
  return apiRequest<{
    projects: {
      id: string;
      title: string;
      status: string;
      cropType: string | null;
      fundingGoalUsdc: number;
      farmer: { displayName: string };
    }[];
  }>("/admin/projects/pending");
}

export async function verifyFarmer(
  farmerId: string,
  decision: AdminReviewDecision,
  notes?: string,
) {
  return apiRequest(`/admin/farmers/${farmerId}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ decision, notes }),
  });
}

export async function reviewProject(
  projectId: string,
  decision: AdminReviewDecision,
  notes?: string,
) {
  return apiRequest(`/admin/projects/${projectId}/review`, {
    method: "PATCH",
    body: JSON.stringify({ decision, notes }),
  });
}
