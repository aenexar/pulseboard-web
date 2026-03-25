# /feature

Scaffold a complete new frontend feature end-to-end.

## Usage
```
/feature <name> — <brief description>
```

## Example
```
/feature environment-switcher — add per-project environment selector
```

## Steps Claude Must Follow

1. Read `CLAUDE.md` fully before writing any code
2. Read `.claude/rules/react-query.md`
3. Read `.claude/rules/component-patterns.md`
4. Read `.claude/rules/routing.md`

5. **Types** — add any new types to `src/types/index.ts`

6. **API routes** — add route builders to `src/lib/api.ts`
   ```typescript
   export const featureRoutes = {
     list: (slug: string, id: string) => `/organisations/${slug}/.../${id}/feature`,
     create: (...) => `...`,
   }
   ```

7. **Hooks** — create `src/hooks/[feature]/use[Feature].ts`
   - One file per hook group
   - Query hooks: `useFeature()`
   - Mutation hooks: `useCreateFeature()`, `useUpdateFeature()`, `useDeleteFeature()`
   - Export all from `src/hooks/[feature]/index.ts`
   - Re-export from `src/hooks/index.ts`

8. **Components** — create in `src/components/[feature]/`
   - One component per file
   - Named exports only (not default)
   - No inline styles

9. **Page** — create `src/app/(dashboard)/[slug]/[feature]/page.tsx`
   - `'use client'` at top
   - Reads params via `useParams()`
   - Shows `<Skeleton />` while loading
   - Thin wrapper — logic in components

10. **Sidebar** — if the feature needs navigation, add it to
    `src/components/layout/sidebar.tsx`

11. Print summary table of all files created

## Rules
- Never fetch data directly — always use React Query hooks
- Never use `useEffect` to fetch data
- Never hardcode API paths — use route builders
- Always add `enabled: !!param` guards on queries
- Always call `invalidateQueries` in mutation `onSuccess`
- New types go in `src/types/index.ts` only
