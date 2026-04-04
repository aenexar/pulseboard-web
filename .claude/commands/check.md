# Check

Run all quality checks on the current web codebase.

## Usage

/check

## What it runs

```bash
# 1. TypeScript — must be zero errors
npm run build

# 2. Lint
npm run lint

# 3. Structural checks
grep -rn "style={{" src/components/ && echo "ERROR: inline styles found"
grep -rn "React.FC" src/ && echo "ERROR: React.FC used — use plain functions"
grep -rn "useEffect.*fetch\|useEffect.*api\." src/ && echo "WARNING: fetching in useEffect"
grep -rn "import.*from.*['\"].*api/\|fetch(" src/components/ && echo "WARNING: direct fetch in component"
```

## Expected state

- Zero TypeScript errors
- Zero lint errors
- No inline styles
- No React.FC
- No direct fetching in components

## Common issues and fixes

**Type error after adding new field to types:**
Search all places that type is used and add the new field

**Hook not updating after mutation:**
Check that invalidateQueries uses the exact same queryKey as the useQuery

**Page shows stale data:**
Check that the queryKey includes all params that affect the data

**Params undefined:**
Always use `params?.slug as string` — never `params.slug`
