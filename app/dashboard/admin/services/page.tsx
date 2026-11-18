"use client";

import { useEffect, useState } from "react";
import { CheckIcon, WrenchIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { ApprovalBadge } from "@/components/badges";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { ApprovalStatus, Service } from "@/lib/types";
import { cn } from "cn";

const FILTERS: ("all" | ApprovalStatus)[] = ["all", "pending", "approved", "rejected"];

type Decision = "approved" | "rejected";

/** Admin service approval queue: approve or reject technician submissions. */
export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [filter, setFilter] = useState<"all" | ApprovalStatus>("all");
  const [target, setTarget] = useState<{ service: Service; decision: Decision } | null>(
    null
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<{ services: Service[] }>("/api/admin/services")
      .then((res) => {
        if (!cancelled) setServices(res.services);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load services");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleDecision() {
    if (!target) return;
    const { service, decision } = target;
    setBusy(true);
    try {
      const res = await api<{ service: Service }>(
        `/api/admin/services/${service._id}/approval`,
        { method: "PATCH", body: { approvalStatus: decision } }
      );
      setServices((prev) =>
        prev === null ? prev : prev.map((item) => (item._id === res.service._id ? res.service : item))
      );
      toast.success(decision === "approved" ? "Service approved" : "Service rejected");
      setTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the service");
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <p className="py-16 text-center text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (services === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  const visible =
    filter === "all" ? services : services.filter((item) => item.approvalStatus === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Service approvals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {services.filter((item) => item.approvalStatus === "pending").length} pending
            review · {services.length} service{services.length === 1 ? "" : "s"} total
          </p>
        </div>
      </div>

      {/* Approval filter chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter services">
        {FILTERS.map((value) => {
          const count =
            value === "all"
              ? services.length
              : services.filter((item) => item.approvalStatus === value).length;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                filter === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {value} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={WrenchIcon}
          title={filter === "all" ? "No services yet" : `No ${filter} services`}
          description={
            filter === "all"
              ? "Submissions from technicians will appear here for review."
              : "Try another filter to see more services."
          }
        />
      ) : (
        <div className="-mx-2 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-44 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((service) => (
                <TableRow key={service._id}>
                  <TableCell className="max-w-72">
                    <div className="flex items-center gap-3">
                      {service.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={service.image}
                          alt={service.title}
                          className="size-10 shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <WrenchIcon className="size-5" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{service.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {service.technicianName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="border-transparent">
                      {service.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatCurrency(service.basePrice)}
                  </TableCell>
                  <TableCell>
                    <ApprovalBadge status={service.approvalStatus} />
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDate(service.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {service.approvalStatus !== "approved" && (
                        <Button
                          size="xs"
                          onClick={() => setTarget({ service, decision: "approved" })}
                        >
                          <CheckIcon /> Approve
                        </Button>
                      )}
                      {service.approvalStatus !== "rejected" && (
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => setTarget({ service, decision: "rejected" })}
                        >
                          <XIcon /> Reject
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) setTarget(null);
        }}
        title={target?.decision === "rejected" ? "Reject this service?" : "Approve this service?"}
        description={
          target
            ? target.decision === "approved"
              ? "It becomes publicly bookable immediately."
              : "It stays hidden from customers."
            : ""
        }
        confirmLabel={target?.decision === "rejected" ? "Reject" : "Approve"}
        cancelLabel="Cancel"
        destructive={target?.decision === "rejected"}
        onConfirm={handleDecision}
        disabled={busy}
      />
    </div>
  );
}
