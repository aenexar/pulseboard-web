# Routing Rules

## Route Groups

```
src/app/
  (auth)/       — login, register, forgot-password, reset-password,
                  verify-email, verify-2fa
                  Layout: minimal, no sidebar
  (dashboard)/  — all authenticated pages
                  Layout: Sidebar + Navbar + EmailVerificationBanner
  auth/         — OAuth callback ONLY (not in (auth) group — intentional)
```

## URL Parameters

```typescript
// In pages — always use useParams(), never props
const params = useParams();
const slug = params?.slug as string;
const id = params?.id as string;

// productSlug is never in the URL params — resolved via useProducts()
const { data: products } = useProducts(slug);
const productSlug = products?.[0]?.slug ?? "";
```

## Redirects

For settings sections that are top-level (e.g. `/settings` → `/settings/general`):

```typescript
// src/app/(dashboard)/[slug]/settings/page.tsx
import { redirect } from "next/navigation";
export default function SettingsRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/${params.slug}/settings/general`);
}
```

## Navigation with Link

```typescript
import Link from 'next/link'

// Always use Link for internal navigation
<Link href={`/${slug}/projects/${id}`}>
  {project.name}
</Link>

// Never use <a> for internal routes
```

## Programmatic Navigation

```typescript
import { useRouter } from "next/navigation";

const router = useRouter();

// After successful create/update
router.push(`/${slug}/projects/${newProject.id}`);

// After delete
router.replace(`/${slug}/projects`);

// After slug change (org/project rename)
router.replace(`/${newSlug}/settings/general`);
```

## Active Link Detection

```typescript
import { usePathname } from "next/navigation";

const pathname = usePathname();

// Exact match
const isActive = pathname === `/${slug}`;

// Prefix match (for nested routes)
const isActive = pathname.startsWith(`/${slug}/projects/${id}`);
```

## Settings Pages Architecture

Each settings tab is its own URL:

```
/[slug]/settings/general     → src/app/(dashboard)/[slug]/settings/general/page.tsx
/[slug]/settings/billing     → src/app/(dashboard)/[slug]/settings/billing/page.tsx
/[slug]/settings/danger      → src/app/(dashboard)/[slug]/settings/danger/page.tsx

/[slug]/projects/[id]/settings/general     → settings/general/page.tsx
/[slug]/projects/[id]/settings/ai          → settings/ai/page.tsx
/[slug]/projects/[id]/settings/repository  → settings/repository/page.tsx
/[slug]/projects/[id]/settings/security    → settings/security/page.tsx

/profile/general      → src/app/(dashboard)/profile/general/page.tsx
/profile/security     → ...
/profile/connections  → ...
/profile/devices      → ...
/profile/activity     → ...
```

Each page renders a single tab component from `src/components/settings/`.
The tab component contains all logic. The page is a thin wrapper with a title.

## Metadata

For pages with specific titles, export metadata:

```typescript
import { Metadata } from "next";
export const metadata: Metadata = { title: "Settings — PulseBoard" };
```

Not required for every page — only where the default title would be unclear.
