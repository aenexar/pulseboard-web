# Implement Phase

Implement a specific roadmap phase item completely and correctly.

## Usage

/phase <phase-number>

## Example

/phase 2.1
/phase 2.3

## Before starting any phase

1. Read CLAUDE.md Roadmap Reference section
2. Run `npm run build` to confirm clean starting state
3. Read the current state of all files you will modify

## After completing any phase

1. Run `npm run build` — must be zero errors
2. Run `npm run lint` — must pass
3. Commit with format:

   ```
   feat: phase <X.X> — <short description>

   - what changed
   - files added
   - files modified
   ```

## Phase reference

### 2.1 — Lead role

- `src/types/index.ts` — add `'lead'` to MemberRole union
- Search components for role comparisons and update to include lead where appropriate

### 2.2 — Invitation enhancements

- `src/types/index.ts` — add frameworks, technicalFocus to Invitation and OrgMember
- `src/lib/api.ts` — update orgRoutes if invitation payload changes
- Find invite modal in `src/components/` (search for "invite" or "InviteMember")
- Add framework multi-select using FRAMEWORK_LABELS from types
- Add technical focus input (label: "Technical focus", not "Role description")
- Add generate developer token checkbox with explanation text
- Update invitation hooks to pass new fields

### 2.3 — Developer token management

- `src/types/index.ts` — add DeveloperToken type
- `src/lib/api.ts` — add devTokenRoutes group
- `src/hooks/dev-tokens/` — useDevTokens, useCreateDevToken, useRevokeDevToken
- `src/app/(dashboard)/[slug]/settings/tokens/page.tsx` — new page
- OR add as new tab in existing settings page
- Show token value once on creation (never again)
- Copy to clipboard button
- Revoke with confirmation dialog

### 2.4 — Member profile enhancements

- Find member list component (search in `src/components/settings/org/`)
- Show frameworks as badges on each member row
- Show technicalFocus as secondary text
- Allow editing own technicalFocus via inline edit or modal

### 2.5 — Insight feedback UI

- Install: `npm install @uiw/react-md-editor`
- `src/types/index.ts` — add InsightComment, InsightFeedback types
- `src/lib/api.ts` — add to insightRoutes: comment, like, dislike endpoints
- `src/hooks/insights/` — useInsightComments, useLikeInsight, useDislikeInsight, useAddInsightComment
- Find insight detail page/sheet and add:
  - Comment thread with markdown rendering
  - Like button (no follow-up required)
  - Dislike button (opens follow-up modal asking why)
  - Markdown editor for new comments

### 2.6 — Permission-aware UI

- `src/lib/api.ts` — add permissions endpoint route
- `src/hooks/permissions/useMyPermissions.ts` — fetch resolved permissions for current user in org
- Search all components for role string comparisons (`role === 'admin'` etc.)
- Replace with permission checks from useMyPermissions
- Gate UI elements (buttons, tabs, forms) based on permissions not raw role

### 2.7 — Custom role UI

- `src/types/index.ts` — add CustomRole type
- `src/lib/api.ts` — add customRoleRoutes
- `src/hooks/custom-roles/` — useCustomRoles, useCreateCustomRole, useUpdateCustomRole, useDeleteCustomRole
- Update invite modal role selector to show built-in + custom + "Create new"
- Inline custom role creator panel with grouped permission picker
- `src/app/(dashboard)/[slug]/settings/roles/page.tsx` — role management page
- Add "Roles" to org settings navigation

### Environment removal (Phase 2 cleanup — do last)

- Delete `src/store/environment.store.ts`
- Delete `src/components/dashboard/environment-switcher.tsx` (if exists)
- Remove all imports of useEnvironmentStore
- Remove environment param from all analytics hooks
- Note: backend handles production-only filtering — frontend just stops sending the param
