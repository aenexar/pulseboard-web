# Component Patterns

## Function Declaration Style

```typescript
// ✅ Correct — plain function
export function StatsCard({ title, value }: Props) {
  return <div>...</div>
}

// ❌ Wrong — React.FC
export const StatsCard: React.FC<Props> = ({ title, value }) => {
  return <div>...</div>
}
```

## Props Type

```typescript
// ✅ Correct — explicit type above the function
type Props = {
  title: string
  value: string | number
  variant?: 'default' | 'error' | 'success'
  onAction?: () => void
}

export function MyComponent({ title, value, variant = 'default', onAction }: Props) {
  ...
}

// ❌ Wrong — inline or implicit
export function MyComponent({ title, value }: { title: string; value: number }) {
```

## Exports

```typescript
// ✅ Named export — components
export function FeatureCard() { ... }

// ✅ Default export — pages and layouts only
export default function ProjectPage() { ... }
export default function DashboardLayout() { ... }

// ❌ Never default export a reusable component
export default function FeatureCard() { ... }
```

## Styling

```typescript
import { cn } from '@/lib/utils'

// ✅ Correct
<div className={cn(
  'base-class another-class',
  isActive && 'bg-brand/10 text-brand',
  variant === 'error' && 'text-destructive',
)} />

// ❌ Never
<div style={{ color: 'red', backgroundColor: 'blue' }} />
```

## Data Fetching in Components

```typescript
// ✅ Correct — use React Query hook
export function ProjectCard({ slug, productSlug, id }: Props) {
  const { data: project, isLoading } = useProject(slug, productSlug, id)
  if (isLoading) return <Skeleton />
  return <div>{project?.name}</div>
}

// ❌ Wrong — direct api call in component
export function ProjectCard({ id }: Props) {
  const [project, setProject] = useState(null)
  useEffect(() => {
    api.get(`/projects/${id}`).then(r => setProject(r.data.data))
  }, [id])
}
```

## Loading States

Always show `<Skeleton />` while data loads — never show empty content:

```typescript
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64" />
    </div>
  )
}
```

## Empty States

Always handle the empty data case explicitly:

```typescript
if (!data || data.length === 0) {
  return (
    <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-lg">
      <Icon className="w-10 h-10 text-muted-foreground/30 mb-3" />
      <p className="text-sm font-medium text-foreground">No items yet</p>
      <p className="text-sm text-muted-foreground mt-1">Description of how to add items</p>
    </div>
  )
}
```

## shadcn/ui Usage

```typescript
// ✅ Always import from @/components/ui/
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// To add a new shadcn component:
// npx shadcn add [component-name]
// Never manually create files in src/components/ui/
```

## Icons

Always use Lucide React:

```typescript
import { Settings, ChevronRight, AlertTriangle } from 'lucide-react'

// Standard icon sizes
<Icon className="w-4 h-4" />    // inline with text
<Icon className="w-5 h-5" />    // standalone action icon
<Icon className="w-10 h-10" />  // empty state illustration
```

## Colour Conventions

```
text-foreground         — primary text
text-muted-foreground   — secondary/hint text
text-brand              — brand/success state
text-destructive        — error/danger state
bg-card                 — card/panel background
bg-accent               — hover state background
bg-brand/10             — active nav item background
border-brand/30         — active nav item border, brand badges
```
