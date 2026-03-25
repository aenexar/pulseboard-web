# PulseBoard Web

## What This Is
Next.js 16 (App Router) + React 19 + TypeScript frontend for PulseBoard.
Deployed on Vercel. The dashboard that developers use to monitor their mobile apps.

## Entry Points
- `src/app/(dashboard)/layout.tsx` — dashboard shell (Sidebar + Navbar + main)
- `src/app/(auth)/layout.tsx` — unauthenticated pages (login, register etc.)
- `src/lib/api.ts` — Axios instance + all API route builders
- `src/store/auth.store.ts` — Zustand auth state (user + token)
- `src/types/index.ts` — all shared TypeScript types

## Tech Stack
| Concern | Library |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| Language | TypeScript 5, strict mode |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI |
| Data fetching | TanStack Query v5 (React Query) |
| HTTP client | Axios |
| Auth state | Zustand v5 with persist middleware |
| Forms | React Hook Form + Zod v4 |
| Charts | Recharts v3 |
| Icons | Lucide React |
| Toasts | Sonner |
| Realtime | Socket.IO client |
| Passkeys | @simplewebauthn/browser |
| Token storage | js-cookie (access token) + httpOnly cookie (refresh token) |

## Project Structure
```
src/
  app/
    (auth)/           — unauthenticated pages (login, register, verify-email etc.)
    (dashboard)/      — authenticated pages wrapped in dashboard layout
      [slug]/         — org-scoped pages
        page.tsx      — org overview
        projects/
          [id]/       — project-scoped pages
            page.tsx  — project overview
            analytics/
            logs/
            feedback/
            insights/
            releases/
            settings/
              details/
              ai/
              repository/
              security/
        settings/
          general/
          billing/
          danger/
        members/
        activity/
      profile/
        general/
        security/
        connections/
        devices/
        activity/
    auth/
      callback/       — OAuth callback (NOT inside (auth) group — important)
  components/
    dashboard/        — dashboard-specific components (StatsCard, Sparkline etc.)
    layout/           — Sidebar, Navbar, EmailVerificationBanner
    onboarding/       — OnboardingChecklist
    settings/
      org/            — GeneralTab, BillingTab, DangerTab
      profile/        — GeneralTab, SecurityTab, ConnectionsTab, DevicesTab, ActivityTab
      project/        — DetailsTab, AITab, RepositoryTab, SecurityTab
    ui/               — shadcn/ui components (never edit these directly)
    upload/           — LogoUpload, AvatarUpload
  hooks/
    [feature]/        — one folder per feature, hooks named use[Feature].ts
  lib/
    api.ts            — Axios instance + route builders
    queryClient.ts    — shared TanStack Query client
    utils.ts          — cn() and other utilities
  store/
    auth.store.ts     — Zustand auth state
    onboarding.store.ts
  types/
    index.ts          — ALL shared types (single file)
```

## API Layer (src/lib/api.ts)

### Axios instance
```typescript
import { api } from '@/lib/api'
```
- Attaches `Authorization: Bearer <token>` header automatically
- Auto-refreshes on 401 via interceptor
- On failed refresh: clears auth, redirects to `/login`

### Route builders
All API routes are defined as named objects in `api.ts`:
```typescript
// Pattern: routeGroup.action(...params) => string
orgRoutes.get(slug)
projectRoutes.list(slug, productSlug)
analyticsRoutes.chart(slug, productSlug, id)
```

Never hardcode API paths in hooks or components — always use the route builders.

When adding new routes, add them to the appropriate group in `api.ts` or create
a new group following the same pattern.

## React Query Hooks (src/hooks/)

### Pattern — every hook follows this exactly
```typescript
// src/hooks/[feature]/use[Feature].ts
import { api, featureRoutes } from '@/lib/api'
import { FeatureType } from '@/types'
import { useQuery } from '@tanstack/react-query'

export function useFeature(slug: string, id: string) {
  return useQuery<FeatureType>({
    queryKey: ['feature', slug, id],
    queryFn: async () => {
      const res = await api.get(featureRoutes.get(slug, id))
      return res.data.data
    },
    enabled: !!slug && !!id,
  })
}
```

### Mutation pattern
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateFeature(slug: string, id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: UpdateFeatureBody) => {
      const res = await api.patch(featureRoutes.update(slug, id), body)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature', slug, id] })
    },
  })
}
```

### Query key conventions
```typescript
['organisations']                           // list of all orgs
['organisation', slug]                      // single org
['products', slug]                          // products for an org
['projects', slug, productSlug]             // projects for a product
['project', slug, productSlug, id]          // single project
['analytics', slug, productSlug, id]        // project analytics
['insights', slug, productSlug, id]         // project insights
['logs', slug, productSlug, id]             // project logs
['profile']                                 // current user profile
```

Always use these exact keys for `invalidateQueries` to work correctly.

## State Management (Zustand)

### Auth store
```typescript
import { useAuthStore } from '@/store/auth.store'

// Reading
const user = useAuthStore(s => s.user)
const isAuthenticated = useAuthStore(s => s.isAuthenticated)

// Writing
useAuthStore.getState().setAuth(user, token)   // login
useAuthStore.getState().updateUser(user)        // profile update
useAuthStore.getState().clearAuth()             // logout
```

Access tokens stored in js-cookie (`pb_access_token`).
Auth state persisted in localStorage (`pb-auth`).

## URL Structure
```
/                           — landing page (not in dashboard layout)
/login                      — (auth) group
/register                   — (auth) group
/forgot-password            — (auth) group
/reset-password             — (auth) group
/verify-email               — (auth) group
/verify-2fa                 — (auth) group
/auth/callback              — OAuth callback (standalone, NOT in (auth) group)

/[slug]                     — org overview (dashboard layout)
/[slug]/members
/[slug]/activity
/[slug]/settings/general
/[slug]/settings/billing
/[slug]/settings/danger
/[slug]/projects/[id]       — project overview
/[slug]/projects/[id]/analytics
/[slug]/projects/[id]/logs
/[slug]/projects/[id]/feedback
/[slug]/projects/[id]/insights
/[slug]/projects/[id]/releases
/[slug]/projects/[id]/settings/details
/[slug]/projects/[id]/settings/ai
/[slug]/projects/[id]/settings/repository
/[slug]/projects/[id]/settings/security

/profile/general
/profile/security
/profile/connections
/profile/devices
/profile/activity
```

**Important**: `/auth/callback` is at `src/app/auth/callback/page.tsx` —
NOT inside the `(auth)` group. This is intentional — it handles OAuth redirects
and must not be wrapped in the auth layout.

## Page Pattern
```typescript
// src/app/(dashboard)/[slug]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useOrganisation, useProducts, useProjects } from '@/hooks'

export default function OrgOverviewPage() {
  const params = useParams()
  const slug = params?.slug as string

  const { data: org, isLoading } = useOrganisation(slug)

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="space-y-8">
      {/* content */}
    </div>
  )
}
```

- All dashboard pages are `'use client'` — they use hooks
- Server components only for static/layout pages
- Always read `slug` and `id` from `useParams()`, not props
- `productSlug` is resolved via `useProducts(slug)?.[0]?.slug`

## Component Patterns

### shadcn/ui components
Never edit files in `src/components/ui/` — these are managed by shadcn.
Always import from `@/components/ui/[component]`.

### Feature components
```typescript
// Functional component, no React.FC
type Props = {
  title: string
  value: string | number
}

export function MyComponent({ title, value }: Props) {
  return <div>...</div>
}
```

- No `React.FC` — use plain function declarations
- Props type defined inline above the function
- Export named, not default (except pages and layouts)
- Use `cn()` from `@/lib/utils` for conditional classes

### Styling
```typescript
import { cn } from '@/lib/utils'

// ✅ Correct
<div className={cn('base-classes', isActive && 'active-classes', variant === 'error' && 'error-classes')} />

// ❌ Never use inline styles
<div style={{ color: 'red' }} />
```

Tailwind v4 with CSS variables for theming:
- `text-brand` — primary brand colour
- `text-muted-foreground` — secondary text
- `bg-card` — card background
- `border-border` — standard border
- `bg-sidebar` — sidebar background
- `bg-brand/10` — 10% opacity brand (active state background)

## Types (src/types/index.ts)
All shared types live in one file. Never create type files elsewhere.
When adding types, add them to the correct section in `types/index.ts`.

Key types:
```typescript
User, Organisation, Product, Project
OrgPlan, WorkspaceMode, MemberRole
Framework, FRAMEWORK_LABELS, FRAMEWORK_GROUPS
AIProvider, AIModel, AIConfig
Insight, InsightSeverity, InsightCategory
PulseEvent, AnalyticsData
ApiResponse<T>  — { success: boolean; data: T }
```

## Settings Pages Architecture
Settings pages are split — each tab is its own URL and component:

```
src/app/(dashboard)/[slug]/settings/general/page.tsx
  → renders <GeneralTab /> from src/components/settings/org/general-tab.tsx

src/app/(dashboard)/[slug]/projects/[id]/settings/details/page.tsx
  → renders <DetailsTab /> from src/components/settings/project/details-tab.tsx
```

Pages are thin wrappers (title + tab component).
All logic lives in the tab component.
`/settings` redirects to `/settings/general` via `redirect()`.

## productSlug Resolution
Most project-level hooks and pages need a `productSlug`.
Always resolve it via the first product:
```typescript
const { data: products } = useProducts(slug)
const productSlug = products?.[0]?.slug ?? ''
```

When `productSlug` is empty string, `enabled: !!productSlug` prevents the
query from firing — this is intentional and handles loading states gracefully.

## Naming Conventions
| Thing | Convention |
|---|---|
| Page files | `page.tsx` (Next.js convention) |
| Layout files | `layout.tsx` |
| Components | `PascalCase.tsx` |
| Hooks | `useCamelCase.ts` |
| Utility functions | `camelCase` |
| Route builders | `featureRoutes.action()` |
| Query keys | `['kebab-case', param1, param2]` |
| CSS classes | Tailwind utility classes only — no custom CSS |

## Scripts
```bash
npm run dev       # next dev --turbopack -p 3001
npm run build     # next build
npm run start     # next start
npm run lint      # eslint
```

## Environment Variables
```
NEXT_PUBLIC_API_URL   — backend URL (required, throws if missing)
```
All env vars prefixed `NEXT_PUBLIC_` are exposed to the browser.
Never put secrets in `NEXT_PUBLIC_` vars.

## What Claude Should Never Do
- Edit files in `src/components/ui/` (shadcn managed)
- Use inline `style={{}}` — always use Tailwind classes
- Use `React.FC` — use plain function declarations
- Hardcode API paths — always use route builders from `api.ts`
- Create new type files — all types go in `src/types/index.ts`
- Fetch data directly in components — always use React Query hooks
- Use `useEffect` to fetch data — React Query handles this
- Access `params.slug` without casting: `params?.slug as string`
- Write mutations without `invalidateQueries` on success
- Default export components (except pages and layouts)
- Access the auth store with `useAuthStore()` without a selector —
  always use `useAuthStore(s => s.specificField)`
