"use client"

import { useEffect, useState } from "react"
import { CalendarIcon } from "lucide-react"

import { StatusBadge } from "@/components/badges"
import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

/** Admin bookings: read-only list of every request on the platform. */
export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [filter, setFilter] = useState<"all" | BookingStatus>("all")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    api<{ bookings: Booking[] }>("/api/admin/bookings")
      .then((res) => {
        if (!cancelled) setBookings(res.bookings)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load bookings"
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

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
        <Skeleton className="h-8 w-44" />
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
          <h1 className="text-2xl font-semibold tracking-tight">
            All bookings
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {bookings.length} booking{bookings.length === 1 ? "" : "s"} across
            the platform
          </p>
        </div>
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
              ? "Every request booked on the platform will appear here."
              : "Try another filter to see more of your bookings."
          }
        />
      ) : (
        <div className="-mx-2 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Preferred date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell className="max-w-52">
                    <p className="truncate font-medium">
                      {booking.serviceTitle}
                    </p>
                    <p className="text-muted-foreground truncate text-xs">
                      {booking.category}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-44">
                    <p className="truncate text-sm">{booking.customerName}</p>
                    <p className="text-muted-foreground truncate text-xs">
                      {booking.customerEmail}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
