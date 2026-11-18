import { Badge } from "@/components/ui/badge";
import { APPROVAL_BADGE, ROLE_BADGE, STATUS_BADGE } from "@/lib/constants";
import { cn } from "cn";
import type { ApprovalStatus, BookingStatus, Role } from "@/lib/types";

const labelize = (value: string) =>
  value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Coloured badge for a booking status (blue/indigo/amber/green/red/gray). */
export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium capitalize", STATUS_BADGE[status], className)}
    >
      {labelize(status)}
    </Badge>
  );
}

/** Coloured badge for a service approval status. */
export function ApprovalBadge({
  status,
  className,
}: {
  status: ApprovalStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium capitalize", APPROVAL_BADGE[status], className)}
    >
      {labelize(status)}
    </Badge>
  );
}

/** Coloured badge for a user role. */
export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent font-medium capitalize", ROLE_BADGE[role], className)}
    >
      {role}
    </Badge>
  );
}
