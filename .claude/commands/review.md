# /review

Code review for the web frontend.

## What to Check

### Architecture Violations (block — must fix)

- [ ] Direct `api` calls inside a component (should be in a hook)
- [ ] `useEffect` used to fetch data (use React Query instead)
- [ ] Inline `style={{}}` used (use Tailwind classes)
- [ ] `React.FC` used (use plain function declarations)
- [ ] Default export on a component (except pages and layouts)
- [ ] API path hardcoded as a string (use route builders from `api.ts`)
- [ ] New type defined outside `src/types/index.ts`
- [ ] shadcn `src/components/ui/` file edited directly
- [ ] `useAuthStore()` called without a selector

### Data Fetching Issues (block — must fix)

- [ ] Missing `enabled` guard on query that depends on a param
- [ ] Mutation missing `invalidateQueries` on success
- [ ] Query key doesn't match convention in CLAUDE.md
- [ ] Direct `axios` or `fetch` call instead of `api` instance

### TypeScript Issues (warn)

- [ ] `any` type used
- [ ] Non-null assertion (`!`) without comment
- [ ] Missing return type on complex functions
- [ ] Props not typed (using implicit `any`)

### Style Issues (warn)

- [ ] Inline styles used
- [ ] Tailwind classes not using `cn()` for conditional logic
- [ ] Custom CSS written instead of Tailwind
- [ ] Missing responsive classes on layout elements

### Accessibility (warn)

- [ ] Interactive element missing `aria-label` or visible text
- [ ] Images missing `alt` text
- [ ] Form inputs missing labels

## Output Format

```markdown
## Review

### ❌ Must Fix

**src/components/feature/FeatureCard.tsx:23**
Direct `api.get(...)` call inside component.
Extract to `useFeature(slug, id)` hook in `src/hooks/feature/`.

### ⚠️ Should Fix

**src/hooks/projects/useProjects.ts:12**
Missing `enabled: !!slug` guard — query fires with empty string.
Add `enabled: !!slug && !!productSlug` to the query options.

### ✅ Good

- All mutations call invalidateQueries correctly
- Components use cn() for conditional classes
- No inline styles
```
