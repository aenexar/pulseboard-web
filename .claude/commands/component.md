# /component

Scaffold a new reusable component.

## Usage
```
/component <ComponentName> — <brief description>
```

## Steps

1. Determine location:
   - Generic UI primitive → `src/components/ui/` (use `npx shadcn add` instead)
   - Dashboard widget → `src/components/dashboard/`
   - Layout piece → `src/components/layout/`
   - Settings tab → `src/components/settings/[org|project|profile]/`
   - Feature-specific → `src/components/[feature]/`

2. Create the component file:

```typescript
// src/components/[folder]/[ComponentName].tsx
import { cn } from '@/lib/utils'

type Props = {
  // explicit prop types — no React.FC
}

export function ComponentName({ prop1, prop2 }: Props) {
  return (
    <div className={cn('base-classes')}>
      {/* content */}
    </div>
  )
}
```

3. If the component fetches data, it uses a React Query hook — not direct api calls
4. If the component has complex logic, extract it into a custom hook

## Checklist
- [ ] Named export (not default)
- [ ] No `React.FC`
- [ ] No inline `style={{}}`
- [ ] All Tailwind classes, no custom CSS
- [ ] `cn()` used for conditional classes
- [ ] Proper TypeScript props type above the function
- [ ] No direct `api` calls — uses hooks or receives data as props
