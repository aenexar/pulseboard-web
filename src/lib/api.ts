import axios from "axios";
import Cookies from "js-cookie";

const TOKEN_KEY = "pb_access_token";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not defined. " +
      "Make sure it is set in your environment variables and the app was rebuilt.",
  );
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        const newToken = data.data.accessToken;
        Cookies.set(TOKEN_KEY, newToken);
        original.headers.authorization = `Bearer ${newToken}`;

        return api(original);
      } catch {
        Cookies.remove(TOKEN_KEY);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export const tokenUtils = {
  set: (token: string) =>
    Cookies.set(TOKEN_KEY, token, {
      expires: 1,
      path: "/",
      sameSite: "strict",
    }),
  get: () => Cookies.get(TOKEN_KEY),
  remove: () => Cookies.remove(TOKEN_KEY, { path: "/" }),
};

// ─── Route builders ───────────────────────────────────────────────────────────

export const orgRoutes = {
  list: () => `/organisations`,
  get: (slug: string) => `/organisations/${slug}`,
  create: () => `/organisations`,
  update: (slug: string) => `/organisations/${slug}`,
  delete: (slug: string) => `/organisations/${slug}`,
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
