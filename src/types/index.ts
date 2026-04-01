// ─── User ─────────────────────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  lastVisitedOrgSlug: string | null;
  onboardingCompletedAt: string | null;
  onboardingDismissedAt: string | null;
  emailVerifiedAt: string | null;
  emailVerificationSource: string | null;
  hasPassword?: boolean;
};

export type Device = {
  id: string;
  device: string;
  browser: string;
  os: string;
  city: string | null;
  country: string | null;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
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

// ─── Organisation ─────────────────────────────────────────────────────────────

export type OrgPlan =
  | "free"
  | "pro"
  | "studio_starter"
  | "studio_growth"
  | "studio_scale"
  | "studio_unlimited"
  | "enterprise";

export type WorkspaceMode = "solo" | "studio" | "enterprise";

export type MemberRole = "owner" | "admin" | "manager" | "developer" | "reader";

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
    avatarUrl: string | null; // ← add this
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
  organisation?: { name: string; slug: string; logoUrl: string | null };
};

export type Organisation = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  plan: OrgPlan;
  workspaceMode: WorkspaceMode;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  members: OrgMember[];
  _count?: {
    products: number;
    members: number;
  };
};

// ─── Product ──────────────────────────────────────────────────────────────────

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  organisationId: string;
  isRestricted: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
    members: number;
  };
};

// ─── Project ──────────────────────────────────────────────────────────────────

export type Project = {
  id: string;
  name: string;
  apiKey: string;
  productId: string;
  description: string | null;
  framework: Framework | null;
  repository: Repository | null;
  isRestricted: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    events: number;
  };
};

// ─── Events ───────────────────────────────────────────────────────────────────

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

export type CrashEvent = {
  id: string;
  timestamp: string;
  platform: string | null;
  os: string | null;
  osVersion: string | null;
  deviceModel: string | null;
  appVersion: string | null;
  isFatal: boolean | null;
  stackTrace: string | null;
  errorMessage: string | null;
  userId: string | null;
  environment: string | null;
};

export type CrashGroupDetail = CrashGroup & {
  events: CrashEvent[];
};

export type PaginatedCrashGroups = {
  items: CrashGroup[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
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
  | "user_behaviour"
  | "security";
export type InsightLevel = "project" | "product" | "org";
export type InsightTrend = "improving" | "worsening" | "stable";

export type InsightReader = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type InsightComparison = {
  trend: InsightTrend;
  summary: string;
  improvement: string | null;
  regression: string | null;
  netChange: string;
  expectedImpact: string;
  recommendation: string;
};

export type InsightRead = {
  id: string;
  insightId: string;
  userId: string;
  readAt: string;
  user: InsightReader;
};

export type Insight = {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  category: InsightCategory;
  metadata: Record<string, unknown> | null;
  level: InsightLevel;
  projectId: string | null;
  productId: string | null;
  organisationId: string | null;
  fingerprint: string | null;
  occurrences: number;
  firstSeenAt: string;
  lastSeenAt: string;
  generatedAt: string;

  // Read receipts
  reads: InsightRead[];

  // Explanation
  explanation: string | null;
  explanationGeneratedAt: string | null;
  explanationGeneratedBy: InsightReader | null;

  // Comparison
  comparedToInsightId: string | null;
  comparedToInsight: {
    id: string;
    title: string;
    severity: InsightSeverity;
    description: string;
    generatedAt: string;
    metadata: Record<string, unknown> | null;
  } | null;
  comparisonData: InsightComparison | null;
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

// ─── Framework ────────────────────────────────────────────────────────────────

export type Framework =
  | "react-native-cli"
  | "react-native-expo"
  | "flutter"
  | "ionic"
  | "xamarin"
  | "android"
  | "ios"
  | "react"
  | "angular"
  | "vue"
  | "nextjs"
  | "nuxt"
  | "electron"
  | "macos"
  | "windows"
  | "linux";

export const FRAMEWORK_LABELS: Record<Framework, string> = {
  "react-native-cli": "React Native CLI",
  "react-native-expo": "React Native Expo",
  flutter: "Flutter",
  ionic: "Ionic",
  xamarin: "Xamarin",
  android: "Android",
  ios: "iOS",
  react: "React",
  angular: "Angular",
  vue: "Vue",
  nextjs: "Next.js",
  nuxt: "Nuxt",
  electron: "Electron",
  macos: "macOS",
  windows: "Windows",
  linux: "Linux",
};

export const FRAMEWORK_GROUPS: { label: string; frameworks: Framework[] }[] = [
  {
    label: "Hybrid Mobile",
    frameworks: [
      "react-native-cli",
      "react-native-expo",
      "flutter",
      "ionic",
      "xamarin",
    ],
  },
  {
    label: "Native Mobile",
    frameworks: ["android", "ios"],
  },
  {
    label: "Web",
    frameworks: ["react", "angular", "vue", "nextjs", "nuxt"],
  },
  {
    label: "Desktop",
    frameworks: ["electron", "macos", "windows", "linux"],
  },
];

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

// ─── Activity ─────────────────────────────────────────────────────────────────

export type ActivityLog = {
  id: string;
  organisationId: string;
  actorId: string | null;
  actorName: string | null;
  actorAvatar: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  targetName: string | null;
  metadata: Record<string, unknown> | null;
  isAdminOnly: boolean;
  createdAt: string;
};

export type UserActivityLog = {
  id: string;
  userId: string;
  action: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type PaginatedActivity<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

// ─── Business Documents ───────────────────────────────────────────────────────

export type DocumentStatus = "processing" | "ready" | "failed";

export type BusinessDocument = {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  pageCount: number | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  _count: {
    chunks: number;
  };
};

export type VersionSummary = {
  appVersion: string;
  totalSessions: number;
  crashedSessions: number;
  crashRate: number;
  crashes: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type VersionDetail = {
  appVersion: string;
  totalSessions: number;
  crashedSessions: number;
  crashes: number;
  crashRate: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  topCrashes: {
    crashGroupId: string | null;
    errorName: string | null;
    errorMessage: string | null;
    occurrences: number;
  }[];
  screenPerformance: {
    screenName: string;
    views: number;
    avgLoadTime: number;
  }[];
  apiPerformance: {
    endpoint: string;
    calls: number;
    avgDuration: number;
  }[];
};

export type PaginatedVersions = {
  items: VersionSummary[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type DeviceSummary = {
  deviceModel: string;
  platform: string;
  manufacturer: string;
  totalEvents: number;
  crashes: number;
  crashRate: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type DeviceDetail = {
  deviceModel: string;
  platform: string;
  manufacturer: string;
  os: string;
  totalEvents: number;
  crashes: number;
  crashRate: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  osVersions: {
    osVersion: string;
    events: number;
  }[];
  appVersions: {
    appVersion: string;
    events: number;
  }[];
  topCrashes: {
    crashGroupId: string | null;
    errorName: string | null;
    errorMessage: string | null;
    occurrences: number;
  }[];
  screenPerformance: {
    screenName: string;
    views: number;
    avgLoadTime: number;
  }[];
};

export type PaginatedDevices = {
  items: DeviceSummary[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type ScreenSummary = {
  screenName: string;
  views: number;
  avgLoadTime: number;
  avgTimeSpent: number;
  firstSeenAt: string;
  lastSeenAt: string;
};

export type ScreenDetail = {
  screenName: string;
  totalViews: number;
  avgLoadTime: number;
  avgTimeSpent: number;
  minLoadTime: number;
  maxLoadTime: number;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
  byVersion: {
    appVersion: string;
    views: number;
    avgLoadTime: number;
  }[];
  byDevice: {
    deviceModel: string;
    views: number;
    avgLoadTime: number;
  }[];
  trend: {
    date: string;
    label: string;
    views: number;
    avgLoad: number;
  }[];
};

export type PaginatedScreens = {
  items: ScreenSummary[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
