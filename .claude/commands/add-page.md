# Add Page

Scaffold a new dashboard page following PulseBoard web conventions.

## Usage

/add-page <route-path> <description>

## Example

/add-page "[slug]/settings/tokens" "Developer token management page"
/add-page "[slug]/settings/roles" "Custom role management page"

## Steps

1. **Create folder** at `src/app/(dashboard)/[route-path]/`

2. **Create page.tsx** — always `'use client'`, reads params via `useParams()`

3. **Create component** in `src/components/` if logic is complex

4. **Add to sidebar** in `src/components/layout/sidebar.tsx` if it needs nav

5. **Add types** to `src/types/index.ts` if needed

6. **Add route builders** to `src/lib/api.ts` if new API endpoints needed

7. **Add hooks** in `src/hooks/[feature]/`

## Page template

```typescript
'use client'

import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { useFeature } from '@/hooks'

export default function FeaturePage() {
  const params = useParams()
  const slug   = params?.slug as string

  const { data, isLoading } = useFeature(slug)

  if (isLoading) return <Skeleton className="h-64" />
  if (!data)     return <div className="text-muted-foreground">Not found.</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Page Title</h1>
        <p className="text-muted-foreground mt-1">Page description</p>
      </div>
      {/* content */}
    </div>
  )
}
```

## Rules

- All dashboard pages are 'use client' — they use hooks
- Read params via useParams() not props
- Always handle isLoading and empty states
- Use Skeleton components for loading states
- Never use default exports for components (only pages)
- Page header uses: h1 text-2xl font-bold + p text-muted-foreground
