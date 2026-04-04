# PulseBoard Web — Claude Context

## What This Is

Next.js (App Router) + React + TypeScript frontend for PulseBoard.
Deployed on Vercel. The dashboard developers use to monitor their mobile apps.

---

## Tech Stack

| Concern       | Library                                        |
| ------------- | ---------------------------------------------- |
| Framework     | Next.js (App Router, standalone output)        |
| Language      | TypeScript strict mode                         |
| Styling       | Tailwind CSS v4                                |
| Components    | shadcn/ui + Radix UI                           |
| Data fetching | TanStack Query v5 (React Query)                |
| HTTP client   | Axios (src/lib/api.ts)                         |
| Auth state    | Zustand v5 with persist middleware             |
| Forms         | React Hook Form + Zod                          |
| Charts        | Recharts v3                                    |
| Icons         | Lucide React                                   |
| Toasts        | Sonner                                         |
| Realtime      | Socket.IO client                               |
| Passkeys      | @simplewebauthn/browser                        |
| Token storage | js-cookie (access) + httpOnly cookie (refresh) |

---

## Project Structure

```
src/
  app/
    (auth)/           — unauthenticated pages (login, register, verify-email)
    (dashboard)/      — authenticated pages with dashboard layout
      [slug]/         — org-scoped pages
        page.tsx                        — org overview
        members/                        — member management
        activity/                       — org activity log
        ai/                             — AI activity page
        insights/                       — org-level AI insights
        settings/
          general/   billing/   danger/
        products/[productSlug]/
          insights/                     — product-level AI insights
          projects/[id]/
            page.tsx                    — project overview (live feed)
            analytics/
              page.tsx                  — analytics overview
              crashes/[crashGroupId]/   — crash list + detail
              versions/[appVersion]/    — versions list + detail
              devices/[deviceModel]/    — devices list + detail
              screens/[screenName]/     — screen perf list + detail
              api/[endpoint]/           — API perf list + detail
            feedback/                   — Kanban board
            insights/                   — project AI insights
            logs/                       — logs page
            releases/                   — releases page
            setup/                      — SDK setup guide
            settings/
              general/  ai/  repository/  security/
    auth/callback/    — OAuth callback (NOT inside (auth) group — intentional)
  components/
    dashboard/        — StatsCard, EventsFeed, BusinessImpactWidget etc.
    feedback/         — feedback-sheet.tsx (detail sheet)
    framework-icons/  — FrameworkIcon component
    layout/           — Sidebar, Navbar, OrgSwitcher, header
    onboarding/       — OnboardingChecklist
    settings/
      org/            — GeneralTab, BillingTab, DangerTab, AIConfigOrgForm,
                        AIContextTab, DocumentUpload
      profile/        — GeneralTab, SecurityTab, ConnectionsTab, DevicesTab
      project/        — DetailsTab, AITab, RepositoryTab, SecurityTab
    ui/               — shadcn/ui components (NEVER edit these)
    upload/           — LogoUpload
  hooks/              — one folder per feature
  lib/
    api.ts            — Axios instance + ALL route builders
    queryClient.ts    — shared TanStack Query client
    utils.ts          — cn() and other utilities
  store/
    auth.store.ts     — Zustand auth (user, token, setAuth, clearAuth)
    environment.store.ts — per-project environment filter (DEPRECATED — removal in Phase 2)
    onboarding.store.ts
  types/
    index.ts          — ALL shared TypeScript types (single file)
```

---

## Current Types State (`src/types/index.ts`)

### MemberRole (current — needs updating in Phase 2.1)

```typescript
export type MemberRole = "owner" | "admin" | "manager" | "developer" | "reader";
// NOTE: 'lead' is NOT yet added — Phase 2.1 adds it
```

### What is MISSING from types (roadmap items)

```
Phase 2.1 — MemberRole: add 'lead'
Phase 2.2 — Invitation: add frameworks, technicalFocus, generateDevToken fields
Phase 2.2 — OrgMember: add frameworks, technicalFocus, customRoleId fields
Phase 2.3 — New type: DeveloperToken
Phase 2.5 — New types: InsightComment, InsightFeedback
Phase 2.7 — New type: CustomRole
```

### Types that already exist (do not re-add)

User, Organisation, OrgMember, Invitation, Product, Project,
MemberRole, OrgPlan, WorkspaceMode, Framework, FRAMEWORK_LABELS,
AIProvider, AIModel, AIConfig, Insight, InsightSeverity, InsightCategory,
InsightLevel, InsightTrend, InsightRead, InsightComparison,
CrashGroup, CrashGroupDetail, CrashEvent, PaginatedCrashGroups,
VersionSummary, VersionDetail, PaginatedVersions,
DeviceSummary, DeviceDetail, PaginatedDevices,
ScreenSummary, ScreenDetail, PaginatedScreens,
ApiEndpointSummary, ApiEndpointDetail, PaginatedApiEndpoints,
FeedbackItem, FeedbackStatus, FeedbackType, FeedbackStats,
FeedbackComment, FeedbackActivityItem, FeedbackItemDetail, ProjectMember,
BusinessDocument, DocumentStatus,
AIActivity, AIActivityResponse, BusinessImpactReport

---

## Route Builders (`src/lib/api.ts`)

All API routes defined as named objects. Never hardcode paths.

### Existing route groups

```typescript
orgRoutes         — organisations CRUD + invitations + members
projectRoutes     — projects CRUD + insights + ai-config
productRoutes     — products CRUD + logo
billingRoutes     — checkout + portal
authRoutes        — last-org, onboarding, 2fa
uploadRoutes      — orgLogo, avatar
profileRoutes     — profile CRUD + sessions + email/password
activityRoutes    — org activity + user activity
connectionRoutes  — OAuth connections
githubRoutes      — GitHub install + repos
passwordResetRoutes
verificationRoutes
twoFactorRoutes
passkeyRoutes
logRoutes         — logs list + stats
feedbackRoutes    — full feedback CRUD + comments + assign + members
releaseRoutes     — releases CRUD
analyticsRoutes   — sparklines + stats + chart
aiHealthRoutes    — provider health status
insightRoutes     — product + org level insights
documentRoutes    — business context documents
crashRoutes       — crashes list + detail + resolve/unresolve
versionRoutes     — versions list + detail
deviceRoutes      — devices list + detail
screenRoutes      — screens list + detail
apiPerformanceRoutes — API endpoints list + detail
aiActivityRoutes  — AI activity log + business impact
```

### What is MISSING (roadmap items)

```
Phase 2.3 — devTokenRoutes (generate, list, revoke)
Phase 2.7 — customRoleRoutes (CRUD)
```

---

## Hooks Structure (`src/hooks/`)

### Existing hook folders

```
activity/     ai-activity/   ai-config/    analytics/
api-performance/  auth/     billing/      connections/
crashes/      devices/      documents/    feedback/
github/       insights/     invitations/  logs/
members/      onboarding/   organisations/ passkeys/
products/     profile/      projects/     realtime/
releases/     screens/      sessions/     two-factor/
uploads/      versions/
```

### Hook pattern (never deviate)

```typescript
// src/hooks/[feature]/use[Feature].ts
import { api, featureRoutes } from "@/lib/api";
import { FeatureType } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useFeature(slug: string, id: string) {
  return useQuery<FeatureType>({
    queryKey: ["feature", slug, id],
    queryFn: async () => {
      const res = await api.get(featureRoutes.get(slug, id));
      return res.data.data;
    },
    enabled: !!slug && !!id,
  });
}
```

### Mutation pattern

```typescript
export function useUpdateFeature(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateBody) => {
      const res = await api.patch(featureRoutes.update(slug), body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature", slug] });
    },
  });
}
```

---

## State Management

### Auth store (`src/store/auth.store.ts`)

```typescript
import { useAuthStore } from "@/store/auth.store";

const user = useAuthStore((s) => s.user); // always use selector
const isAuth = useAuthStore((s) => s.isAuthenticated);

// Mutations — call on getState() not in render
useAuthStore.getState().setAuth(user, token);
useAuthStore.getState().updateUser(user);
useAuthStore.getState().clearAuth();
```

### Environment store (`src/store/environment.store.ts`)

**DEPRECATED** — to be removed in Phase 2 (environment filter removal).
Do not add new usages. The store still exists but will be deleted.

---

## Absolute Rules

- Never edit `src/components/ui/` — shadcn managed, hands off
- Never use inline `style={{}}` — always Tailwind classes
- Never use `React.FC` — plain function declarations only
- Never hardcode API paths — always use route builders from `api.ts`
- Never create new type files — all types in `src/types/index.ts`
- Never fetch data directly in components — always React Query hooks
- Never use `useEffect` to fetch data — React Query handles this
- Never forget `enabled: !!param` guard in useQuery when params are optional
- Never access auth store without a selector: `useAuthStore(s => s.field)`
- Never default export components (only pages and layouts)
- Never write mutations without `invalidateQueries` on success
- Never cast params without optional chaining: `params?.slug as string`
- Always use `cn()` from `@/lib/utils` for conditional classes

---

## Page Pattern

```typescript
'use client'
import { useParams } from 'next/navigation'

export default function SomePage() {
  const params = useParams()
  const slug = params?.slug as string
  const id   = params?.id   as string

  const { data, isLoading } = useSomeHook(slug, id)

  if (isLoading) return <Skeleton ... />
  if (!data)     return <div>Not found</div>

  return <div className="space-y-8">...</div>
}
```

---

## productSlug Resolution

Most project hooks need a `productSlug`. Always resolve via:

```typescript
const { data: products } = useProducts(slug);
const productSlug = products?.[0]?.slug ?? "";
// enabled: !!productSlug prevents queries firing before resolved
```

---

## Styling Conventions

```typescript
// CSS variables (defined in globals.css)
text-brand          // primary brand colour
text-muted-foreground
bg-card
border-border
bg-sidebar
bg-brand/10         // 10% opacity — active state backgrounds
bg-destructive/10   // error state backgrounds

// Always use cn() for conditional classes
<div className={cn('base', isActive && 'active', variant === 'error' && 'text-destructive')} />
```

---

## Settings Architecture

Settings pages are thin wrappers — all logic in tab components:

```
/[slug]/settings/general → <GeneralTab /> from components/settings/org/general-tab.tsx
/[slug]/settings/billing → <BillingTab />
/[slug]/settings/danger  → <DangerTab />
```

Org settings tabs: `general`, `billing`, `danger`, `ai` (AI Config + docs)
Project settings tabs: `general`, `ai`, `repository`, `security`

---

## Sidebar Navigation (`src/components/layout/sidebar.tsx`)

Current org-level nav items:

- Overview `/[slug]`
- Members `/[slug]/members`
- Activity `/[slug]/activity`
- AI Insights `/[slug]/insights`
- AI Activity `/[slug]/ai`
- Settings `/[slug]/settings`

Product nav items (per product): Overview, AI Insights, Settings, Projects (collapsible)

Project nav items (per project): Overview, Setup, Analytics, Releases, Logs, Feedback, Insights, Settings

---

## Commands

```bash
npm run dev       # next dev --turbopack -p 3001
npm run build     # next build
npm run start     # next start
npm run lint      # eslint
```

---

## Environment Variables

```
NEXT_PUBLIC_API_URL   — backend URL (required, throws if missing at startup)
```

---

## Roadmap Reference (what is coming)

### Phase 2 — All web changes

**2.1** Add `lead` to `MemberRole` in `src/types/index.ts`
Update all role-based UI conditionals throughout components

**2.2** Invitation flow updates:

- Add framework multi-select to invite modal
- Add technical focus input field
- Add generate developer token checkbox
- Update `Invitation` and `OrgMember` types
- Update invitation hooks to pass new fields

**2.3** Developer token management:

- New page: `src/app/(dashboard)/[slug]/settings/tokens/page.tsx`
- Or new tab in org settings
- New types: `DeveloperToken`
- New route group: `devTokenRoutes` in `api.ts`
- New hooks: `useDevTokens`, `useCreateDevToken`, `useRevokeDevToken`

**2.4** Member profile enhancements:

- Show frameworks and technicalFocus on member list
- Allow editing own technicalFocus
- Admin/owner can edit any member's frameworks

**2.5** Insight feedback UI:

- Markdown editor component (recommend `@uiw/react-md-editor`)
- Comment thread on insight detail page
- Like/dislike buttons with follow-up modal
- New types: `InsightComment`, `InsightFeedback`
- New hooks: `useInsightComments`, `useLikeInsight`, `useDislikeInsight`

**2.6** Permission-aware UI:

- `useCurrentUserPermissions(slug)` hook that fetches resolved permissions
- All role-gated UI elements conditionally rendered by permission
- Remove direct role string comparisons from components

**2.7** Custom role UI:

- Role selector in invite modal: built-in roles + custom roles + "Create new"
- Inline custom role creator with grouped permission picker
- New page: `src/app/(dashboard)/[slug]/settings/roles/page.tsx`
- New types: `CustomRole`
- New hooks: `useCustomRoles`, `useCreateCustomRole`, `useUpdateCustomRole`

**Environment removal (Phase 2 cleanup):**

- Delete `src/store/environment.store.ts`
- Delete `src/components/dashboard/environment-switcher.tsx`
- Remove `useEnvironmentStore` from all hooks and pages
- All analytics queries hardcode `environment: 'production'` on backend
  (handled in backend — frontend just stops sending the param)
