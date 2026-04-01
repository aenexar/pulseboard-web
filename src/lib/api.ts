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

// ─── Shared refresh promise ───────────────────────────────────────────────────
// Prevents race condition where multiple simultaneous 401s each trigger
// a separate refresh — which burns the refresh token after the first one

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  const newToken = data.data.accessToken;
  Cookies.set(TOKEN_KEY, newToken, { expires: 1, path: "/", sameSite: "lax" });
  return newToken;
}

// ─── Auto refresh on 401 ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const is2FARoute = original?.url?.includes("/auth/verify-2fa");
    const isRefreshRoute = original?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !is2FARoute &&
      !isRefreshRoute
    ) {
      original._retry = true;

      try {
        // All concurrent 401s share the same promise — only one refresh fires
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;
        original.headers.authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError: unknown) {
        if (
          axios.isAxiosError(refreshError) &&
          refreshError.response?.status === 401
        ) {
          const { useAuthStore } = await import("@/store/auth.store");
          const { useOnboardingStore } =
            await import("@/store/onboarding.store");
          const { queryClient } = await import("@/lib/queryClient");
          useAuthStore.getState().clearAuth();
          useOnboardingStore.getState().reset();
          queryClient.clear();
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

// ─── Proactive token refresh on tab focus ────────────────────────────────────
// When the user switches back to the tab after 15+ min, refresh the token
// before React Query fires all its stale queries — prevents the 401 flood

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState !== "visible") return;

    const token = Cookies.get(TOKEN_KEY);
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expiresAt = payload.exp * 1000;
      const twoMinutes = 2 * 60 * 1000;

      if (Date.now() > expiresAt - twoMinutes) {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        await refreshPromise;
      }
    } catch {
      // Silent — the interceptor handles it on the next API call
    }
  });
}

// ─── Token utilities ─────────────────────────────────────────────────────────

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
  explainInsight: (
    slug: string,
    productSlug: string,
    id: string,
    insightId: string,
  ) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/insights/${insightId}/explain`,
  insightById: (
    slug: string,
    productSlug: string,
    id: string,
    insightId: string,
  ) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/insights/${insightId}`,
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
  verify2FA: () => `/auth/verify-2fa`,
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

export const passwordResetRoutes = {
  request: () => `/auth/forgot-password`,
  validate: (token: string) => `/auth/reset-password/${token}`,
  reset: () => `/auth/reset-password`,
};

export const verificationRoutes = {
  resend: () => `/auth/verify-email/resend`,
};

export const twoFactorRoutes = {
  status: () => `/profile/2fa/status`,
  setup: () => `/profile/2fa/setup`,
  enable: () => `/profile/2fa/enable`,
  disable: () => `/profile/2fa/disable`,
  regenerateRecovery: () => `/profile/2fa/recovery-codes/regenerate`,
};

export const passkeyRoutes = {
  registrationOptions: () => `/profile/passkeys/registration-options`,
  verifyRegistration: () => `/profile/passkeys/verify-registration`,
  authOptions: () => `/auth/passkey/options`,
  verifyAuth: () => `/auth/passkey/verify`,
  list: () => `/profile/passkeys`,
  delete: (id: string) => `/profile/passkeys/${id}`,
};

export const logRoutes = {
  list: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/logs`,
  stats: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/logs/stats`,
};

export const feedbackRoutes = {
  list: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/feedback`,
  stats: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/feedback/stats`,
  updateStatus: (
    slug: string,
    productSlug: string,
    id: string,
    feedbackId: string,
  ) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/feedback/${feedbackId}/status`,
};

export const releaseRoutes = {
  list: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/releases`,
  create: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/releases`,
  delete: (slug: string, productSlug: string, id: string, releaseId: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/releases/${releaseId}`,
};

export const sessionAuditRoutes = {
  list: () => `/profile/sessions`,
  revoke: (id: string) => `/profile/sessions/${id}`,
  revokeAll: () => `/profile/sessions`,
};

export const analyticsRoutes = {
  sparklines: (slug: string, productSlug: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/sparklines`,
  stats: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/stats`,
  chart: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/chart`,
};

export const aiHealthRoutes = {
  status: (slug: string) => `/organisations/${slug}/ai/health`,
};

export const insightRoutes = {
  // Product level
  productInsights: (slug: string, productSlug: string) =>
    `/organisations/${slug}/products/${productSlug}/insights`,
  triggerProduct: (slug: string, productSlug: string) =>
    `/organisations/${slug}/products/${productSlug}/insights/trigger`,

  // Org level
  orgInsights: (slug: string) => `/organisations/${slug}/insights`,
  triggerOrg: (slug: string) => `/organisations/${slug}/insights/trigger`,
};

export const documentRoutes = {
  list: (slug: string) => `/organisations/${slug}/documents`,
  upload: (slug: string) => `/organisations/${slug}/documents`,
  delete: (slug: string, documentId: string) =>
    `/organisations/${slug}/documents/${documentId}`,
};

export const crashRoutes = {
  list: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/analytics/crashes`,
  detail: (
    slug: string,
    productSlug: string,
    id: string,
    crashGroupId: string,
  ) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/analytics/crashes/${crashGroupId}`,
  resolve: (
    slug: string,
    productSlug: string,
    id: string,
    crashGroupId: string,
  ) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/analytics/crashes/${crashGroupId}/resolve`,
  unresolve: (
    slug: string,
    productSlug: string,
    id: string,
    crashGroupId: string,
  ) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/analytics/crashes/${crashGroupId}/unresolve`,
};

export const versionRoutes = {
  list: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/analytics/versions`,
  detail: (slug: string, productSlug: string, id: string, appVersion: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/analytics/versions/${encodeURIComponent(appVersion)}`,
};

export const deviceRoutes = {
  list: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/analytics/devices`,
  detail: (
    slug: string,
    productSlug: string,
    id: string,
    deviceModel: string,
  ) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/analytics/devices/${encodeURIComponent(deviceModel)}`,
};

export const screenRoutes = {
  list: (slug: string, productSlug: string, id: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/analytics/screens`,
  detail: (slug: string, productSlug: string, id: string, screenName: string) =>
    `/organisations/${slug}/products/${productSlug}/projects/${id}/analytics/screens/${encodeURIComponent(screenName)}`,
};
