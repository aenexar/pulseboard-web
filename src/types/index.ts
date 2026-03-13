// ─── Organisation ─────────────────────────────────────────────────────────────

export type OrgPlan = "free" | "pro" | "enterprise";

export type MemberRole = "owner" | "admin" | "member";

export type OrgMember = {
  id: string;
  organisationId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type Invitation = {
  id: string;
  organisationId: string;
  email: string;
  role: MemberRole;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

export type Organisation = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  plan: OrgPlan;
  createdAt: string;
  updatedAt: string;
  members: OrgMember[];
  _count?: {
    projects: number;
    members: number;
  };
};

// ─── Project (userId removed, organisationId added) ───────────────────────────

export type Project = {
  id: string;
  name: string;
  apiKey: string;
  organisationId: string;
  description: string | null;
  framework: Framework | null;
  repository: Repository | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    events: number;
  };
};

// ─── Framework ────────────────────────────────────────────────────────────────

export type Framework =
  | "react_native_cli"
  | "expo"
  | "flutter"
  | "ionic"
  | "xamarin"
  | "android_view"
  | "android_compose"
  | "ios_uikit"
  | "ios_swiftui";

export const FRAMEWORK_LABELS: Record<Framework, string> = {
  react_native_cli: "React Native CLI",
  expo: "Expo",
  flutter: "Flutter",
  ionic: "Ionic",
  xamarin: "Xamarin",
  android_view: "Android (View)",
  android_compose: "Android (Compose)",
  ios_uikit: "iOS (UIKit)",
  ios_swiftui: "iOS (SwiftUI)",
};

export const FRAMEWORK_GROUPS: Record<string, Framework[]> = {
  "Hybrid Mobile": ["react_native_cli", "expo", "flutter", "ionic", "xamarin"],
  "Native Android": ["android_view", "android_compose"],
  "Native iOS": ["ios_uikit", "ios_swiftui"],
};

// ─── Repository ───────────────────────────────────────────────────────────────

export type RepositoryProvider = "github" | "gitlab" | "bitbucket" | "other";

export type Repository = {
  provider: RepositoryProvider;
  url: string;
  branch: string;
};

export const REPOSITORY_PROVIDER_LABELS: Record<RepositoryProvider, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  bitbucket: "Bitbucket",
  other: "Other",
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export type CrashRate = {
  totalSessions: number;
  crashedSessions: number;
  crashRate: number;
  crashFreeSessions: number;
  crashFreeUsers: number;
};

export type CrashGroup = {
  id: string;
  errorName: string;
  errorMessage: string;
  occurrences: number;
  affectedUsers: number;
  firstSeenAt: string;
  lastSeenAt: string;
  resolved: boolean;
};

export type CrashByVersion = {
  appVersion: string;
  crashes: number;
  sessions: number;
  crashRate: number;
};

export type CrashByDevice = {
  deviceModel: string;
  crashes: number;
  sessions: number;
  crashRate: number;
};

export type ApiPerformance = {
  endpoint: string;
  httpMethod: string;
  avgDuration: number;
  p95Duration: number;
  errorRate: number;
  callCount: number;
};

export type ScreenPerformance = {
  screenName: string;
  avgLoadTime: number;
  avgTimeSpent: number;
  viewCount: number;
};

export type AnalyticsData = {
  crashRate: CrashRate;
  topCrashes: CrashGroup[];
  crashesByVersion: CrashByVersion[];
  crashesByDevice: CrashByDevice[];
  apiPerformance: ApiPerformance[];
  screenPerformance: ScreenPerformance[];
};

// ─── Insights ─────────────────────────────────────────────────────────────────

export type InsightSeverity = "critical" | "warning" | "info";

export type InsightCategory =
  | "crash"
  | "performance"
  | "network"
  | "release"
  | "user_behaviour";

export type Insight = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  category: InsightCategory;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  fingerprint: string | null;
  occurrences: number;
  firstSeenAt: string;
  lastSeenAt: string;
  generatedAt: string;
};

export type TriggerInsightsResponse = {
  message: string;
  minutesRemaining?: number;
  lastTriggeredAt?: string;
};

// ─── AI Config ────────────────────────────────────────────────────────────────

export type AIProvider = "anthropic" | "openai" | "moonshot" | "google";

export type AIModel =
  | "claude-sonnet-4-5"
  | "claude-haiku-4-5"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "moonshot-v1-8k"
  | "moonshot-v1-32k"
  | "gemini-1.5-pro"
  | "gemini-1.5-flash";

export type CronPreset =
  | "manual"
  | "0 9 * * *"
  | "0 9,21 * * *"
  | "0 */12 * * *"
  | "0 9 * * 1"
  | "custom";

export type AIConfig = {
  provider: AIProvider;
  model: AIModel;
  keyHint: string;
  cronSchedule: string;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertAIConfigPayload = {
  provider: AIProvider;
  model: AIModel;
  apiKey: string;
  cronPreset: CronPreset;
  cronSchedule?: string;
};

export const PROVIDER_MODELS: Record<AIProvider, AIModel[]> = {
  anthropic: ["claude-sonnet-4-5", "claude-haiku-4-5"],
  openai: ["gpt-4o", "gpt-4o-mini"],
  moonshot: ["moonshot-v1-8k", "moonshot-v1-32k"],
  google: ["gemini-1.5-pro", "gemini-1.5-flash"],
};

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  anthropic: "Anthropic",
  openai: "OpenAI",
  moonshot: "Moonshot",
  google: "Google",
};

export const MODEL_LABELS: Record<AIModel, string> = {
  "claude-sonnet-4-5": "Claude Sonnet 4.5",
  "claude-haiku-4-5": "Claude Haiku 4.5",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o Mini",
  "moonshot-v1-8k": "Moonshot v1 8k",
  "moonshot-v1-32k": "Moonshot v1 32k",
  "gemini-1.5-pro": "Gemini 1.5 Pro",
  "gemini-1.5-flash": "Gemini 1.5 Flash",
};

export const CRON_PRESET_LABELS: Record<CronPreset, string> = {
  manual: "Manual only",
  "0 9 * * *": "Once a day (9:00 AM)",
  "0 9,21 * * *": "Twice a day (9:00 AM & 9:00 PM)",
  "0 */12 * * *": "Every 12 hours",
  "0 9 * * 1": "Weekly (Monday 9:00 AM)",
  custom: "Custom schedule",
};

// ─── Events ───────────────────────────────────────────────────────────────────

export type PulseEvent = {
  id: string;
  projectId: string;
  type: "error" | "event" | "metric";
  name: string;
  payload: Record<string, unknown>;
  timestamp: string;
};
