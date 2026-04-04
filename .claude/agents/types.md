# Types Agent

Specialist agent for managing TypeScript types in PulseBoard web.

## When to use

Use when adding new types, updating existing types, or resolving
TypeScript errors related to type mismatches.

## The single source of truth

ALL shared types live in `src/types/index.ts`.
Never create new type files anywhere else.

## Adding a new type

1. Find the correct section in `src/types/index.ts`
2. Add type with proper JSDoc if non-obvious
3. Export it — all types are named exports
4. If it's a constant/lookup (like FRAMEWORK_LABELS), add it as `export const`

## Updating an existing type

When the backend adds a new field to a model:

1. Update the type in `src/types/index.ts`
2. Search for all places that type is destructured or used
3. Update any hooks that fetch that type (may need to update queryFn)
4. Update any forms or mutations that send that type

## Types to add per phase

### Phase 2.1

```typescript
// Update existing MemberRole
export type MemberRole =
  | "owner"
  | "admin"
  | "lead"
  | "manager"
  | "developer"
  | "reader";
```

### Phase 2.2

```typescript
// Update OrgMember — add new fields
export type OrgMember = {
  // ...existing fields...
  frameworks: string[];
  technicalFocus: string | null;
  customRoleId: string | null;
};

// Update Invitation — add new fields
export type Invitation = {
  // ...existing fields...
  frameworks: string[];
  technicalFocus: string | null;
  generateDevToken: boolean;
};
```

### Phase 2.3

```typescript
export type DeveloperToken = {
  id: string;
  label: string;
  token: string | null; // only present on creation, null after
  lastUsedAt: string | null;
  expiresAt: string;
  createdAt: string;
};
```

### Phase 2.5

```typescript
export type InsightComment = {
  id: string;
  content: string; // markdown
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

export type InsightFeedbackType = "liked" | "disliked";

export type InsightFeedback = {
  id: string;
  type: InsightFeedbackType;
  followUp: string | null; // markdown — only present for disliked
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

// Update Insight type — add new fields
export type Insight = {
  // ...existing fields...
  comments: InsightComment[];
  feedbacks: InsightFeedback[];
  myFeedback: InsightFeedback | null; // current user's feedback
  likeCount: number;
  dislikeCount: number;
};
```

### Phase 2.7

```typescript
export type CustomRole = {
  id: string;
  organisationId: string;
  name: string;
  description: string | null;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
};
```

## Common type patterns in this codebase

### Paginated response

```typescript
export type PaginatedX = {
  items: X[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
```

### API response wrapper

The `api.get()` returns `{ data: { success: boolean, data: T } }`.
Hooks always return `res.data.data` — the inner data only.

### Nullable vs optional

- `field: string | null` — field is always present but can be null
- `field?: string` — field may not be present at all
  Use `string | null` for DB nullable fields, `field?` for optional request params.
