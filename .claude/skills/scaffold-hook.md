# Scaffold Hook

Auto-invoked when creating a new React Query hook.

## Query Hook Template
```typescript
// src/hooks/[feature]/use[Feature].ts
import { api, featureRoutes } from '@/lib/api'
import { FeatureType } from '@/types'
import { useQuery } from '@tanstack/react-query'

export function useFeature(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  return useQuery<FeatureType[]>({
    queryKey: ['feature', slug, productSlug, projectId],
    queryFn: async () => {
      const res = await api.get(
        featureRoutes.list(slug, productSlug, projectId),
      )
      return res.data.data
    },
    enabled: !!slug && !!productSlug && !!projectId,
  })
}
```

## Mutation Hook Template
```typescript
import { api, featureRoutes } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type CreatePayload = { name: string }

export function useCreateFeature(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreatePayload) => {
      const res = await api.post(
        featureRoutes.create(slug, productSlug, projectId),
        body,
      )
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feature', slug, productSlug, projectId],
      })
    },
  })
}
```

## Index File Template
```typescript
// src/hooks/[feature]/index.ts
export * from './useFeature'
export * from './useCreateFeature'
export * from './useUpdateFeature'
export * from './useDeleteFeature'
```

## Root Hooks Index
After creating, add to `src/hooks/index.ts`:
```typescript
export * from './[feature]'
```

## Checklist
- [ ] `enabled` guards on all params
- [ ] Query key matches CLAUDE.md convention
- [ ] `invalidateQueries` in mutation `onSuccess`
- [ ] Types imported from `@/types`
- [ ] Route builders used, no hardcoded paths
- [ ] Exported from feature index and root index
