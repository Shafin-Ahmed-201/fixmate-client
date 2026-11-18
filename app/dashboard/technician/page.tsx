"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2Icon,
  HourglassIcon,
  InboxIcon,
  PlusSquareIcon,
  WrenchIcon,
} from "lucide-react";

import { StatusBadge } from "@/components/badges";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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
import { formatDate } from "@/lib/format";
import type { Booking, BookingStatus, Service } from "@/lib/types";
import { Cell, Pie, PieChart } from "recharts";

const STATUS_COLORS: Record<BookingStatus, string> = {
  requested: "#3b82f6",
  accepted: "#6366f1",
  "in-progress": "#f59e0b",
  completed: "#10b981",
  rejected: "#ef4444",
  cancelled: "#9ca3af",
};

const chartConfig = {
  requested: { label: "Requested", color: "#3b82f6" },
  accepted: { label: "Accepted", color: "#6366f1" },
  "in-progress": { label: "In progress", color: "#f59e0b" },
  completed: { label: "Completed", color: "#10b981" },
  rejected: { label: "Rejected", color: "#ef4444" },
  cancelled: { label: "Cancelled", color: "#9ca3af" },
} satisfies ChartConfig;

/** Technician home: KPI cards, requests-by-status chart and recent requests. */
export default function TechnicianDashboardPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api<{ services: Service[] }>("/api/services/my"),
      api<{ bookings: Booking[] }>("/api/bookings/technician"),
    ])
      .then(([serviceRes, bookingRes]) => {
        if (!cancelled) {
          setServices(serviceRes.services);
          setBookings(bookingRes.bookings);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load your dashboard");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="py-16 text-center text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (services === null || bookings === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-lg lg:col-span-2" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </div>
    );
  }

  const pending = services.filter(
    (service) => service.approvalStatus === "pending"
  ).length;
  const requested = bookings.filter((booking) => booking.status === "requested").length;
  const inProgress = bookings.filter(
    (booking) => booking.status === "accepted" || booking.status === "in-progress"
  ).length;
  const completed = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  const statusCounts = (Object.keys(STATUS_COLORS) as BookingStatus[])
    .map((status) => ({
      status,
      count: bookings.filter((booking) => booking.status === status).length,
    }))
    .filter((entry) => entry.count > 0);

  const recent = bookings.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your services and booking requests at a glance.
          </p>
        </div>
        <Button render={<Link href="/dashboard/technician/add-service" />} size="sm">
          <PlusSquareIcon /> Add service
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={WrenchIcon}
          label="Total services"
          value={services.length}
          hint={`${pending} awaiting approval`}
        />
        <StatCard
          icon={InboxIcon}
          label="New requests"
          value={requested}
          hint="Awaiting your response"
          tone="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={HourglassIcon}
          label="In progress"
          value={inProgress}
          hint="Accepted or being worked on"
          tone="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          icon={CheckCircle2Icon}
          label="Completed"
          value={completed}
          hint="Finished jobs"
          tone="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent requests */}
        <Card className="gap-0 py-5 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent requests</CardTitle>
              <CardDescription>Your five latest requests</CardDescription>
            </div>
            <Button
              render={<Link href="/dashboard/technician/requests" />}
              variant="outline"
              size="xs"
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="px-5">
            {recent.length === 0 ? (
              <EmptyState
                icon={InboxIcon}
                title="No requests yet"
                description="New booking requests from customers will appear here."
              />
            ) : (
              <div className="-mx-2 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.map((booking) => (
                      <TableRow key={booking._id}>
                        <TableCell className="max-w-36">
                          <p className="truncate font-medium">
                            {booking.customerName}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-48">
                          <p className="truncate">{booking.serviceTitle}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {booking.category}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDate(booking.preferredDate)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status chart */}
        <Card className="gap-0 py-5">
          <CardHeader>
            <CardTitle className="text-base">Requests by status</CardTitle>
            <CardDescription>Where your requests stand</CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            {statusCounts.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nothing to chart yet.
              </p>
            ) : (
              <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-72">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={52}
                    outerRadius={88}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {statusCounts.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
