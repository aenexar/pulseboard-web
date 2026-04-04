# Add Hook

Scaffold a new React Query hook following PulseBoard web conventions.

## Usage

/add-hook <feature> <action> <description>

## Example

/add-hook dev-tokens list "List developer tokens for current user"
/add-hook custom-roles create "Create a new custom role for an org"

## Steps

1. **Add route builder** to `src/lib/api.ts` in the appropriate group
   or create a new group if the feature is new:

   ```typescript
   export const devTokenRoutes = {
     list: () => `/auth/dev-tokens`,
     create: () => `/auth/dev-tokens`,
     revoke: (id: string) => `/auth/dev-tokens/${id}`,
   };
   ```

2. **Add types** to `src/types/index.ts` if needed

3. **Create hook file** at `src/hooks/[feature]/use[Feature][Action].ts`
   - Query hook pattern for reads
   - Mutation hook pattern for writes

4. **Export** from `src/hooks/[feature]/index.ts`

5. **Export** from `src/hooks/index.ts`

## Query hook template

```typescript
import { api, featureRoutes } from "@/lib/api";
import { FeatureType } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useFeature(slug: string) {
  return useQuery<FeatureType[]>({
    queryKey: ["feature", slug],
    queryFn: async () => {
      const res = await api.get(featureRoutes.list(slug));
      return res.data.data;
    },
    enabled: !!slug,
  });
}
```

## Mutation hook template

```typescript
import { api, featureRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateFeature(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateFeatureBody) => {
      const res = await api.post(featureRoutes.create(slug), body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature", slug] });
    },
  });
}
```

## Rules

- Never fetch in components — always use hooks
- Always add `enabled` guards for optional params
- Always invalidate related queries on mutation success
- Never hardcode API paths — use route builders
- Export from both feature index.ts AND src/hooks/index.ts
