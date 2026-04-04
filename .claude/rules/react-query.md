# React Query Rules

## Query Keys — Use These Exactly

```typescript
["organisations"][("organisation", slug)][("products", slug)][
  ("projects", slug, productSlug)
][("project", slug, productSlug, id)][("analytics", slug, productSlug, id)][
  ("project-stats", slug, productSlug, id)
][("project-chart", slug, productSlug, id)][("sparklines", slug, productSlug)][
  ("insights", slug, productSlug, id)
][("ai-config", slug, productSlug, id)][("logs", slug, productSlug, id)][
  ("log-stats", slug, productSlug, id)
][("feedback", slug, productSlug, id)][
  ("feedback-stats", slug, productSlug, id)
][("releases", slug, productSlug, id)]["profile"]["profile-activity"][
  "profile-sessions"
]["passkeys"]["connections"]["2fa-status"];
```

## The enabled Guard

Every query that depends on a param must guard against empty strings:

```typescript
// ✅ Correct
useQuery({
  queryKey: ['project', slug, productSlug, id],
  queryFn: ...,
  enabled: !!slug && !!productSlug && !!id,
})

// ❌ Wrong — fires with empty string, produces bad API calls
useQuery({
  queryKey: ['project', slug, productSlug, id],
  queryFn: ...,
})
```

## Mutation Success — Always Invalidate

```typescript
useMutation({
  mutationFn: ...,
  onSuccess: () => {
    // Invalidate the affected query
    queryClient.invalidateQueries({ queryKey: ['projects', slug, productSlug] })

    // Invalidate parent if child count changed
    queryClient.invalidateQueries({ queryKey: ['organisation', slug] })
  },
})
```

## Optimistic Updates (for fast UI)

Use for toggle/status changes where the result is predictable:

```typescript
useMutation({
  mutationFn: (id: string) => api.patch(routes.markRead(slug, productSlug, projectId, id)),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['insights', slug, productSlug, projectId] })
    const previous = queryClient.getQueryData(['insights', ...])
    queryClient.setQueryData(['insights', ...], (old: Insight[]) =>
      old.map(i => i.id === id ? { ...i, isRead: true } : i)
    )
    return { previous }
  },
  onError: (_, __, context) => {
    queryClient.setQueryData(['insights', ...], context?.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['insights', ...] })
  },
})
```

## Shared Query Client

```typescript
import { queryClient } from "@/lib/queryClient";

// Use for imperative operations outside React components
queryClient.invalidateQueries({ queryKey: ["profile"] });
queryClient.clear(); // used on logout
```

## staleTime and caching

Don't set custom `staleTime` unless there's a specific reason.
Default behaviour (0ms staleTime, refetch on window focus) is correct for
a dashboard where data changes frequently.

Exception: static data like framework lists — use `staleTime: Infinity`.

## Error Handling

React Query surfaces errors via `isError` and `error` — handle them in the component:

```typescript
const { data, isLoading, isError } = useProjects(slug, productSlug)

if (isError) return <p className="text-destructive text-sm">Failed to load projects</p>
```

For mutations, use `toast` from `sonner` to show feedback:

```typescript
import { toast } from 'sonner'

useMutation({
  mutationFn: ...,
  onSuccess: () => toast.success('Project updated'),
  onError: () => toast.error('Failed to update project'),
})
```
