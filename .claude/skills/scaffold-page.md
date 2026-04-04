# Scaffold Page

Auto-invoked when creating a new dashboard page.

## Standard Page Template

```typescript
'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useParams } from 'next/navigation'
import { useProducts } from '@/hooks'
import { useFeature } from '@/hooks/feature'

export default function FeaturePage() {
  const params      = useParams()
  const slug        = params?.slug      as string
  const projectId   = params?.id        as string

  const { data: products }             = useProducts(slug)
  const productSlug                    = products?.[0]?.slug ?? ''

  const { data, isLoading }            = useFeature(slug, productSlug, projectId)

  if (isLoading || !productSlug) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Page Title</h1>
        <p className="text-muted-foreground mt-1">
          Short description of this section
        </p>
      </div>

      {/* Page content */}
    </div>
  )
}
```

## Settings Page Template (thin wrapper)

```typescript
'use client'

import { FeatureTab } from '@/components/settings/project/feature-tab'
import { useProducts } from '@/hooks'
import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProjectSettingsFeaturePage() {
  const params      = useParams()
  const slug        = params?.slug as string
  const projectId   = params?.id   as string

  const { data: products } = useProducts(slug)
  const productSlug        = products?.[0]?.slug ?? ''

  if (!productSlug) return <Skeleton className="h-64 max-w-2xl" />

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feature</h1>
        <p className="text-muted-foreground mt-1">
          Description of this settings section
        </p>
      </div>
      <FeatureTab slug={slug} productSlug={productSlug} projectId={projectId} />
    </div>
  )
}
```

## Redirect Page Template

```typescript
import { redirect } from "next/navigation";

export default function SettingsRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/${params.slug}/settings/general`);
}
```

## Checklist

- [ ] `'use client'` at top (for all dashboard pages)
- [ ] `useParams()` used, not props
- [ ] `productSlug` resolved via `useProducts`
- [ ] `isLoading` shows `<Skeleton />` components
- [ ] `!productSlug` also shows skeleton (prevents empty flicker)
- [ ] Top-level spacing is `space-y-8`
- [ ] Page title is `h1` with `text-2xl font-bold text-foreground`
- [ ] Default export
