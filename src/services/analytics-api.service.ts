import { apiRequest } from "@/lib/api/http-client";

export async function fetchInvestorAnalytics() {
  return apiRequest<{ analytics: Record<string, unknown> }>("/analytics/investor").then((d) => d.analytics);
}

export async function fetchFarmerAnalytics() {
  return apiRequest<{ analytics: Record<string, unknown> }>("/analytics/farmer").then((d) => d.analytics);
}

export async function fetchAdminAnalytics() {
  return apiRequest<{ analytics: Record<string, unknown> }>("/analytics/admin").then((d) => d.analytics);
}
