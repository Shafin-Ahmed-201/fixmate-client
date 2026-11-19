"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import {
  CalendarIcon,
  CreditCardIcon,
  EyeIcon,
  XCircleIcon,
} from "lucide-react"
import { toast } from "sonner"

import { StatusBadge } from "@/components/badges"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { api, ApiError } from "@/lib/api"
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

/** Customer bookings: filter by status, cancel requests, pay completed jobs. */
export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [filter, setFilter] = useState<"all" | BookingStatus>("all")
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    api<{ bookings: Booking[] }>("/api/bookings/my")
      .then((res) => setBookings(res.bookings))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load bookings")
      )
  }, [])

  useEffect(load, [load])

  async function handleCancel() {
    if (!cancelTarget) return
    setActionBusy(true)
    try {
      await api(`/api/bookings/${cancelTarget._id}/cancel`, { method: "PATCH" })
      toast.success("Booking cancelled")
      setCancelTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cancellation failed")
    } finally {
      setActionBusy(false)
    }
  }

  async function handlePay(booking: Booking) {
    setPayingId(booking._id)
    try {
      const res = await api<{ url: string }>(
        "/api/payments/create-checkout-session",
        {
          method: "POST",
          body: { bookingId: booking._id },
        }
      )
      window.location.assign(res.url)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Please sign in again to pay")
      } else {
        toast.error(
          err instanceof Error ? err.message : "Could not start checkout"
        )
      }
      setPayingId(null)
    }
  }

  if (error) {
    return (
      <p className="py-16 text-center text-sm text-destructive" role="alert">
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
          <h1 className="text-2xl font-semibold tracking-tight">My bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {bookings.length} total request{bookings.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/services" />}
          size="sm"
          variant="outline"
        >
          Browse services
        </Button>
      </div>

      {/* Status filter chips */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter bookings"
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
          icon={CalendarIcon}
          title={
            filter === "all"
              ? "No bookings yet"
              : `No ${filter.replace("-", " ")} bookings`
          }
          description={
            filter === "all"
              ? "When you book a repair it will appear here with its live status."
              : "Try another filter to see more of your bookings."
          }
        >
          {filter === "all" && (
            <Button
              nativeButton={false}
              render={<Link href="/services" />}
              className="mt-4"
            >
              Book your first repair
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="-mx-2 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Preferred date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="max-w-52">
                    <p className="truncate font-medium">
                      {booking.serviceTitle}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {booking.category}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-36">
                    <p className="truncate text-sm">{booking.technicianName}</p>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDate(booking.preferredDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-transparent font-medium capitalize",
                        booking.paymentStatus === "paid"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {booking.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm whitespace-nowrap">
                    {formatCurrency(booking.finalAmount ?? booking.basePrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      {booking.status === "requested" && (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setCancelTarget(booking)}
                        >
                          <XCircleIcon /> Cancel
                        </Button>
                      )}
                      {booking.status === "completed" &&
                        booking.paymentStatus === "unpaid" && (
                          <Button
                            size="xs"
                            onClick={() => handlePay(booking)}
                            disabled={payingId === booking._id}
                          >
                            <CreditCardIcon />
                            {payingId === booking._id
                              ? "Redirecting…"
                              : "Pay now"}
                          </Button>
                        )}
                      {booking.status === "completed" &&
                        booking.paymentStatus === "paid" && (
                          <Button
                            nativeButton={false}
                            render={
                              <Link href="/dashboard/customer/payments" />
                            }
                            size="xs"
                            variant="ghost"
                          >
                            <EyeIcon /> Receipt
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
        open={cancelTarget !== null}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
        title="Cancel this booking?"
        description={
          cancelTarget
            ? `“${cancelTarget.serviceTitle}” on ${formatDate(cancelTarget.preferredDate)} will be cancelled. This cannot be undone.`
            : ""
        }
        confirmLabel="Yes, cancel booking"
        cancelLabel="Keep booking"
        onConfirm={handleCancel}
        disabled={actionBusy}
      />
    </div>
  )
}
