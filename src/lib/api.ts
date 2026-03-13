import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const tokenUtils = {
  set: (token: string) => {
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  },
  clear: () => {
    document.cookie = "token=; path=/; max-age=0";
  },
};

// ─── Route builders ───────────────────────────────────────────────────────────

export const orgRoutes = {
  list: () => `/organisations`,
  get: (slug: string) => `/organisations/${slug}`,
  create: () => `/organisations`,
  update: (slug: string) => `/organisations/${slug}`,
  delete: (slug: string) => `/organisations/${slug}`,
  members: (slug: string) => `/organisations/${slug}/members`,
  updateMember: (slug: string, userId: string) =>
    `/organisations/${slug}/members/${userId}/role`,
  removeMember: (slug: string, userId: string) =>
    `/organisations/${slug}/members/${userId}`,
  invitations: (slug: string) => `/organisations/${slug}/invitations`,
  cancelInvite: (token: string) => `/invitations/${token}`,
  getInvite: (token: string) => `/invitations/${token}`,
  acceptInvite: (token: string) => `/invitations/${token}/accept`,
};

export const projectRoutes = {
  list: (slug: string) => `/organisations/${slug}/projects`,
  get: (slug: string, id: string) => `/organisations/${slug}/projects/${id}`,
  create: (slug: string) => `/organisations/${slug}/projects`,
  update: (slug: string, id: string) => `/organisations/${slug}/projects/${id}`,
  repository: (slug: string, id: string) =>
    `/organisations/${slug}/projects/${id}/repository`,
  delete: (slug: string, id: string) => `/organisations/${slug}/projects/${id}`,
  analytics: (slug: string, id: string) =>
    `/organisations/${slug}/projects/${id}/analytics`,
  insights: (slug: string, id: string) =>
    `/organisations/${slug}/projects/${id}/insights`,
  trigger: (slug: string, id: string) =>
    `/organisations/${slug}/projects/${id}/insights/trigger`,
  markRead: (slug: string, id: string, insightId: string) =>
    `/organisations/${slug}/projects/${id}/insights/${insightId}/read`,
  aiConfig: (slug: string, id: string) =>
    `/organisations/${slug}/projects/${id}/ai-config`,
};
