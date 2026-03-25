# /page

Scaffold a new dashboard page.

## Usage
```
/page <route> — <brief description>
```

## Example
```
/page [slug]/projects/[id]/environments — environment switcher page
```

## Steps

1. Create the page file: `src/app/(dashboard)/[route]/page.tsx`
2. If the route needs a redirect (e.g. `/settings` → `/settings/general`), use:
```typescript
import { redirect } from 'next/navigation'
export default function PageRedirect({ params }: { params: { slug: string } }) {
  redirect(`/${params.slug}/settings/general`)
}
```

3. Standard page template:
```typescript
'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useParams } from 'next/navigation'
import { useProducts } from '@/hooks'
import { useFeature } from '@/hooks/feature'

export default function FeaturePage() {
  const params      = useParams()
  const slug        = params?.slug        as string
  const projectId   = params?.id          as string

  const { data: products } = useProducts(slug)
  const productSlug         = products?.[0]?.slug ?? ''

  const { data, isLoading } = useFeature(slug, productSlug, projectId)

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
        <p className="text-muted-foreground mt-1">Page description</p>
      </div>
      {/* content */}
    </div>
  )
}
```

4. Add to sidebar if navigation is needed (`src/components/layout/sidebar.tsx`)

## Checklist
- [ ] `'use client'` at the top
- [ ] Params read with `useParams()` and cast: `params?.slug as string`
- [ ] `productSlug` resolved via `useProducts(slug)?.[0]?.slug ?? ''`
- [ ] Loading state shows `<Skeleton />` components
- [ ] Page title is `h1` with `text-2xl font-bold text-foreground`
- [ ] Top-level spacing uses `space-y-8`
