# Permissions Agent

Specialist agent for implementing permission-aware UI in PulseBoard web.

## When to use

Use when working on Phase 2.6 (permission-aware UI) or any component
that needs to conditionally render based on what the current user can do.

## Current state (before Phase 2.6)

Components currently check role directly — this is the pattern to REPLACE:

```typescript
// ❌ Old pattern — do not add new instances of this
const { data: org } = useOrganisation(slug);
const myMember = org?.members.find((m) => m.userId === user?.id);
if (myMember?.role === "admin" || myMember?.role === "owner") {
  // show button
}
```

## New pattern (Phase 2.6+)

```typescript
// ✅ New pattern
const { data: permissions } = useMyPermissions(slug);

if (permissions?.includes("insights.generate_org")) {
  // show generate button
}
```

## Permission strings (full list)

```typescript
type Permission =
  // Organisation
  | "org.view"
  | "org.update"
  | "org.delete"
  | "org.view_members"
  | "org.invite_members"
  | "org.remove_members"
  | "org.update_member_roles"
  | "org.view_activity"
  | "org.manage_billing"
  // AI Configuration
  | "ai_config.view"
  | "ai_config.update_org"
  | "ai_config.update_product"
  | "ai_config.update_project"
  // AI Insights — Generation
  | "insights.generate_org"
  | "insights.generate_all_products"
  | "insights.generate_single_product"
  | "insights.generate_all_projects"
  | "insights.generate_single_project"
  // AI Insights — Interaction
  | "insights.view"
  | "insights.feedback"
  | "insights.comment"
  | "insights.delete_any_comment"
  | "insights.delete_own_comment"
  // Business Documents
  | "documents.upload"
  | "documents.delete"
  | "documents.view"
  // Products & Projects
  | "product.view"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "project.view"
  | "project.create"
  | "project.update"
  | "project.delete"
  | "project.view_analytics"
  | "project.resolve_crashes"
  | "project.view_logs"
  | "project.view_live_feed"
  // Feedback
  | "feedback.view"
  | "feedback.update_status"
  | "feedback.assign"
  | "feedback.add_note"
  | "feedback.comment"
  // Releases
  | "releases.view"
  | "releases.create"
  | "releases.delete"
  // Developer Portal
  | "dev_portal.generate_token"
  | "dev_portal.view_all_data"
  | "dev_portal.generate_insights"
  | "dev_portal.toggle_flags"
  // Custom Roles
  | "custom_roles.manage";
```

## Role → permission summary for UI decisions

| What user wants to do     | Minimum role | Permission to check              |
| ------------------------- | ------------ | -------------------------------- |
| Generate org insights     | admin        | insights.generate_org            |
| Generate product insights | lead         | insights.generate_single_product |
| Generate project insights | manager      | insights.generate_single_project |
| Update org AI config      | admin        | ai_config.update_org             |
| Update project AI config  | lead         | ai_config.update_project         |
| Invite members            | lead         | org.invite_members               |
| Remove members            | admin        | org.remove_members               |
| Upload business documents | lead         | documents.upload                 |
| Create projects           | lead         | project.create                   |
| Delete products           | admin        | product.delete                   |
| Manage custom roles       | admin        | custom_roles.manage              |
| Generate dev token        | developer    | dev_portal.generate_token        |
| Generate dev AI insights  | lead         | dev_portal.generate_insights     |

## useMyPermissions hook (to be created in Phase 2.6)

```typescript
// src/hooks/permissions/useMyPermissions.ts
export function useMyPermissions(slug: string) {
  return useQuery<string[]>({
    queryKey: ["my-permissions", slug],
    queryFn: async () => {
      const res = await api.get(`/organisations/${slug}/my-permissions`);
      return res.data.data;
    },
    enabled: !!slug,
    staleTime: 60_000, // permissions change infrequently
  });
}

// Helper hook for single permission check
export function useCanDo(slug: string, permission: string): boolean {
  const { data: permissions } = useMyPermissions(slug);
  return permissions?.includes(permission) ?? false;
}
```

## UI pattern for conditional rendering

```typescript
// In a component
const canGenerate = useCanDo(slug, 'insights.generate_org')
const canInvite   = useCanDo(slug, 'org.invite_members')

return (
  <>
    {canGenerate && <Button onClick={generate}>Generate Insights</Button>}
    {canInvite   && <Button onClick={openInvite}>Invite Member</Button>}
  </>
)
```
