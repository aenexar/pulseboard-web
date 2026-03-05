export type User = {
  id: string;
  name: string;
  email: string;
};

export type Project = {
  id: string;
  name: string;
  apiKey: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { events: number };
};

export type EventType = "error" | "event" | "metric";

export type PulseEvent = {
  id: string;
  projectId: string;
  type: EventType;
  name: string;
  payload: Record<string, unknown>;
  timestamp: string;
  receivedAt: string;
};

export type AuthResponse = {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export type CrashRate = {
  totalSessions: number;
  crashedSessions: number;
  crashRate: number;
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
};

export type CrashByDevice = {
  deviceModel: string;
  crashes: number;
};

export type ApiPerformance = {
  endpoint: string;
  calls: number;
  avgDuration: number;
};

export type ScreenPerformance = {
  screenName: string;
  views: number;
  avgLoadTime: number;
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
  fingerprint: string;
  occurrences: number;
  firstSeenAt: string;
  lastSeenAt: string;
  generatedAt: string;
};

export type TriggerInsightsResponse = {
  success: boolean;
  message: string;
  data?: {
    minutesRemaining: number;
    lastTriggeredAt: string;
  };
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
  moonshot: "Moonshot (Kimi)",
  google: "Google Gemini",
};

export const MODEL_LABELS: Record<AIModel, string> = {
  "claude-sonnet-4-5": "Claude Sonnet 4.5",
  "claude-haiku-4-5": "Claude Haiku 4.5",
  "gpt-4o": "GPT-4o",
  "gpt-4o-mini": "GPT-4o Mini",
  "moonshot-v1-8k": "Moonshot v1 8K",
  "moonshot-v1-32k": "Moonshot v1 32K",
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
