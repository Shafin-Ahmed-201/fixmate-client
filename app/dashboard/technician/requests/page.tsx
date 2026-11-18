"use client"

import { useCallback, useEffect, useState } from "react"
import {
  CheckCircle2Icon,
  CheckIcon,
  InboxIcon,
  Loader2Icon,
  PlayIcon,
  XCircleIcon,
} from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/badges"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Booking, BookingStatus } from "@/lib/types"
import { cn } from "cn"

const FILTERS: ("all" | BookingStatus)[] = [
  "all",
  "requested",
  "accepted",
  "in-progress",
  "completed",
  "rejected",
  "cancelled",
]

/** Technician requests: filter, accept/reject, start and complete jobs. */
export default function TechnicianRequestsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [filter, setFilter] = useState<"all" | BookingStatus>("all")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [completing, setCompleting] = useState<Booking | null>(null)
  const [finalAmountInput, setFinalAmountInput] = useState("")
  const [completingBusy, setCompletingBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    api<{ bookings: Booking[] }>("/api/bookings/technician")
      .then((res) => setBookings(res.bookings))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load requests")
      )
  }, [])

  useEffect(load, [load])

  /** Applies one state-machine transition and reloads on success. */
  async function updateStatus(
    bookingId: string,
    status: BookingStatus,
    options: { finalAmount?: number; success: string }
  ): Promise<boolean> {
    setBusyId(bookingId)
    try {
      const body: { status: BookingStatus; finalAmount?: number } = { status }
      if (options.finalAmount !== undefined)
        body.finalAmount = options.finalAmount
      await api<{ booking: Booking }>(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        body,
      })
      toast.success(options.success)
      load()
      return true
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update the request"
      )
      return false
    } finally {
      setBusyId(null)
    }
  }

  async function handleReject() {
    if (!rejectTarget) return
    setRejecting(true)
    const ok = await updateStatus(rejectTarget._id, "rejected", {
      success: "Request rejected",
    })
    if (ok) setRejectTarget(null)
    setRejecting(false)
  }

  async function handleComplete(event: React.FormEvent) {
    event.preventDefault()
    if (!completing) return

    const amount = Number(finalAmountInput)
    if (!(amount > 0)) {
      toast.error("Enter a valid final amount")
      return
    }

    setCompletingBusy(true)
    try {
      const body: { status: BookingStatus; finalAmount: number } = {
        status: "completed",
        finalAmount: Math.round(amount * 100) / 100,
      }
      await api<{ booking: Booking }>(
        `/api/bookings/${completing._id}/status`,
        {
          method: "PATCH",
          body,
        }
      )
      toast.success("Job completed — customer can now pay")
      setCompleting(null)
      load()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not complete the job"
      )
    } finally {
      setCompletingBusy(false)
    }
  }

  if (error) {
    return (
      <p className="text-destructive py-16 text-center text-sm" role="alert">
        {error}
      </p>
    )
  }

  if (bookings === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  const visible =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Accept, work and complete the booking requests from your customers.
          </p>
        </div>
      </div>

      {/* Status filter chips */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter requests"
      >
        {FILTERS.map((value) => {
          const count =
            value === "all"
              ? bookings.length
              : bookings.filter((booking) => booking.status === value).length
          return (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors",
                filter === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {value.replace("-", " ")} ({count})
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title={
            filter === "all"
              ? "No requests yet"
              : `No ${filter.replace("-", " ")} requests`
          }
          description={
            filter === "all"
              ? "When a customer books one of your services it will appear here."
              : "Try another filter to see more of your requests."
          }
        />
      ) : (
        <div className="-mx-2 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Preferred date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-44 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="max-w-40">
                    <p className="truncate font-medium">
                      {booking.customerName}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {booking.customerPhone}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-52">
                    <p className="truncate font-medium">
                      {booking.serviceTitle}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {booking.category}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDate(booking.preferredDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="text-right text-sm whitespace-nowrap">
                    {formatCurrency(booking.finalAmount ?? booking.basePrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      {booking.status === "requested" && (
                        <>
                          <Button
                            size="xs"
                            onClick={() =>
                              void updateStatus(booking._id, "accepted", {
                                success: "Request accepted",
                              })
                            }
                            disabled={busyId === booking._id}
                          >
                            <CheckIcon /> Accept
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => setRejectTarget(booking)}
                          >
                            <XCircleIcon /> Reject
                          </Button>
                        </>
                      )}
                      {booking.status === "accepted" && (
                        <Button
                          size="xs"
                          onClick={() =>
                            void updateStatus(booking._id, "in-progress", {
                              success: "Job started",
                            })
                          }
                          disabled={busyId === booking._id}
                        >
                          <PlayIcon /> Start job
                        </Button>
                      )}
                      {booking.status === "in-progress" && (
                        <Button
                          size="xs"
                          onClick={() => {
                            setCompleting(booking)
                            setFinalAmountInput(
                              String(booking.finalAmount ?? booking.basePrice)
                            )
                          }}
                        >
                          <CheckCircle2Icon /> Complete
                        </Button>
                      )}
                      {booking.status === "completed" &&
                        booking.paymentStatus === "paid" && (
                          <Badge
                            variant="outline"
                            className="border-transparent bg-emerald-500/15 font-medium text-emerald-600 dark:text-emerald-400"
                          >
                            Paid
                          </Badge>
                        )}
                      {(booking.status === "rejected" ||
                        booking.status === "cancelled" ||
                        (booking.status === "completed" &&
                          booking.paymentStatus !== "paid")) && (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Reject confirmation */}
      <ConfirmDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(null)
        }}
        title="Reject this request?"
        description="The customer will be notified — this cannot be undone."
        confirmLabel="Yes, reject request"
        cancelLabel="Keep request"
        onConfirm={handleReject}
        disabled={rejecting}
      />

      {/* Complete job dialog */}
      <Dialog
        open={completing !== null}
        onOpenChange={(open) => {
          if (!open) setCompleting(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete job</DialogTitle>
            <DialogDescription>
              Set the final amount the customer will pay via Stripe.
            </DialogDescription>
          </DialogHeader>
          {completing && (
            <form onSubmit={handleComplete} className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="font-medium">{completing.serviceTitle}</p>
                <p className="text-muted-foreground text-sm">
                  Base price: {formatCurrency(completing.basePrice)}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="final-amount">Final amount (USD)</Label>
                <Input
                  id="final-amount"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={finalAmountInput}
                  onChange={(event) => setFinalAmountInput(event.target.value)}
                  disabled={completingBusy}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCompleting(null)}
                  disabled={completingBusy}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={completingBusy}>
                  {completingBusy ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <CheckCircle2Icon />
                  )}
                  {completingBusy ? "Completing…" : "Mark complete"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
