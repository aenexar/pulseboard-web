# /hook

Scaffold a new React Query hook.

## Usage
```
/hook <hookName> — <brief description>
```

## Steps

1. Identify which route builder to use from `src/lib/api.ts`
   If route doesn't exist, add it first
2. Create `src/hooks/[feature]/use[Feature].ts`
3. Export from `src/hooks/[feature]/index.ts`
4. Re-export from `src/hooks/index.ts`

## Query Hook Template
```typescript
import { api, featureRoutes } from '@/lib/api'
import { FeatureType } from '@/types'
import { useQuery } from '@tanstack/react-query'

export function useFeature(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  return useQuery<FeatureType>({
    queryKey: ['feature', slug, productSlug, projectId],
    queryFn: async () => {
      const res = await api.get(
        featureRoutes.get(slug, productSlug, projectId)
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

type CreateFeatureBody = {
  name: string
}

export function useCreateFeature(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateFeatureBody) => {
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

## Checklist
- [ ] `enabled` guard on all params that could be empty string
- [ ] Query key matches the convention in CLAUDE.md
- [ ] `invalidateQueries` called on mutation success
- [ ] Return type is explicit (TypeScript infers from queryFn but document it)
- [ ] Hook exported from feature index and root hooks index
