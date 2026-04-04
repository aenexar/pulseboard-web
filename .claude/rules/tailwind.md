# Tailwind Rules

## The Golden Rule

**No inline styles. Ever.**
Everything is a Tailwind class. If Tailwind doesn't have a utility, use a CSS variable.

## Conditional Classes — Always Use cn()

```typescript
import { cn } from '@/lib/utils'

// ✅ Correct
<div className={cn(
  'base px-3 py-2 rounded-md text-sm',
  isActive && 'bg-brand/10 text-brand',
  isDisabled && 'opacity-50 cursor-not-allowed',
  size === 'lg' && 'px-6 py-4 text-base',
)} />

// ❌ Wrong — string concatenation
<div className={`base ${isActive ? 'active' : ''}`} />

// ❌ Wrong — inline style
<div style={{ opacity: isDisabled ? 0.5 : 1 }} />
```

## CSS Variables (Theme Tokens)

These are defined in the global CSS and map to Tailwind utilities:

### Text colours

```
text-foreground          — primary content text
text-muted-foreground    — secondary/supporting text
text-brand               — success, positive, brand actions
text-destructive         — errors, danger, delete actions
```

### Backgrounds

```
bg-background            — page background
bg-card                  — card, panel, popover background
bg-accent                — hover state background
bg-muted                 — subtle background (input fields, code blocks)
bg-sidebar               — sidebar background
bg-brand/10              — 10% brand opacity (active nav, success state bg)
bg-destructive/10        — 10% destructive opacity (error state bg)
```

### Borders

```
border-border            — standard dividers and card borders
border-sidebar-border    — sidebar specific borders
border-brand/30          — brand-tinted border (active items, badges)
border-destructive/30    — destructive-tinted border (danger cards)
```

## Spacing System

Use consistent spacing scale:

```
gap-1   = 4px   — tight icon + text pairs
gap-2   = 8px   — icon + text in nav items
gap-3   = 12px  — form label + input
gap-4   = 16px  — card grid columns
gap-6   = 24px  — section spacing within a page
gap-8   = 32px  — major section spacing
```

Page content always uses `space-y-8` as the top-level container.

## Responsive Breakpoints

```
(default)  — mobile first
md:        — 768px  — two column grids
lg:        — 1024px — desktop sidebar visible, three/four column grids
```

Common patterns:

```typescript
// Sidebar hide on mobile
"hidden lg:flex";

// Grid columns
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

// Padding
"p-4 lg:p-8";

// Top padding offset for mobile hamburger button
"pt-16 lg:pt-8";
```

## Animation

Use built-in Tailwind utilities:

```
transition-colors  — colour transitions on hover
animate-pulse      — loading/live indicators
```

## What Not to Do

```typescript
// ❌ Custom CSS
.my-component { color: red }

// ❌ Inline styles
<div style={{ marginTop: 16 }} />

// ❌ Arbitrary values without good reason
<div className="w-[347px]" />  // use w-80 or w-96 instead

// ❌ Tailwind v3 syntax that doesn't work in v4
// (check that classes exist in v4 before using)
```
