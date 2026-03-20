import { Badge } from "@/components/ui/badge";

export function StatusBadge({
  status,
}: {
  status: "active" | "logged_out" | "expired";
}) {
  if (status === "active") {
    return (
      <Badge
        variant="outline"
        className="text-brand border-brand/30 bg-brand/10 text-xs"
      >
        Active
      </Badge>
    );
  }
  if (status === "logged_out") {
    return (
      <Badge
        variant="outline"
        className="text-muted-foreground border-border text-xs"
      >
        Logged out
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10 text-xs"
    >
      Expired
    </Badge>
  );
}
