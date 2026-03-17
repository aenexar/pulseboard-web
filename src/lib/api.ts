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
        const { useAuthStore } = await import("@/store/auth.store");
        const { useOnboardingStore } = await import("@/store/onboarding.store");
        const { queryClient } = await import("@/lib/queryClient");
        useAuthStore.getState().clearAuth();
        useOnboardingStore.getState().reset();
        queryClient.clear();
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
      sameSite: "lax",
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
  list: (slug: string, productSlug: string) =>
    `/organisations/${slug}/products/${productSlug}/projects`,
  get: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}`,
  create: (slug: string, productSlug: string) =>
    `/organisations/${slug}/products/${productSlug}/projects`,
  update: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}`,
  repository: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/repository`,
  delete: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}`,
  analytics: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/analytics`,
  insights: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/insights`,
  trigger: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/insights/trigger`,
  markRead: (
    slug: string,
    productSlug: string,
    id: string,
    insightId: string,
  ) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/insights/${insightId}/read`,
  aiConfig: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/ai-config`,
};

export const billingRoutes = {
  checkout: (slug: string) => `/billing/${slug}/checkout`,
  portal: (slug: string) => `/billing/${slug}/portal`,
};

export const publicRoutes = {
  newsletterSubscribe: () => `/newsletter/subscribe`,
  supportContact: () => `/support/contact`,
};

export const authRoutes = {
  lastOrg: () => `/auth/last-org`,
  completeOnboarding: () => `/auth/complete-onboarding`,
  dismissOnboarding: () => `/auth/dismiss-onboarding`,
};

export const uploadRoutes = {
  orgLogo: (slug: string) => `/organisations/${slug}/logo`,
  avatar: () => `/upload/avatar`,
};

export const profileRoutes = {
  get: () => `/profile`,
  update: () => `/profile`,
  changeEmail: () => `/profile/email`,
  changePassword: () => `/profile/password`,
  sessions: () => `/profile/sessions`,
  revokeSession: (tokenId: string) => `/profile/sessions/${tokenId}`,
  revokeAll: () => `/profile/sessions`,
  refreshProvider: () => `/profile/refresh-provider`,
};

export const activityRoutes = {
  org: (slug: string) => `/organisations/${slug}/activity`,
  user: () => `/profile/activity`,
};

export const productRoutes = {
  list: (slug: string) => `/organisations/${slug}/products`,
  get: (slug: string, productSlug: string) =>
    `/organisations/${slug}/products/${productSlug}`,
  create: (slug: string) => `/organisations/${slug}/products`,
  update: (slug: string, productSlug: string) =>
    `/organisations/${slug}/products/${productSlug}`,
  delete: (slug: string, productSlug: string) =>
    `/organisations/${slug}/products/${productSlug}`,
  logo: (slug: string, productSlug: string) =>
    `/organisations/${slug}/products/${productSlug}/logo`,
};

export const connectionRoutes = {
  list: () => `/profile/connections`,
  disconnect: (provider: string) => `/profile/connections/${provider}`,
};

export const githubRoutes = {
  install: (slug: string) => `/github/install/${slug}`,
  repos: (slug: string) => `/organisations/${slug}/github/repos`,
};
