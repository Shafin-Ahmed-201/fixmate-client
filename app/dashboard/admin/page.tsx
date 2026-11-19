"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { BanknoteIcon, CalendarIcon, UsersIcon, WrenchIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { StatusBadge } from "@/components/badges"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { api } from "@/lib/api"
import { formatCurrency, formatDate } from "@/lib/format"
import type { AdminStats, BookingStatus, Payment, Role } from "@/lib/types"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

const STATUS_COLORS: Record<BookingStatus, string> = {
  requested: "#3b82f6",
  accepted: "#6366f1",
  "in-progress": "#f59e0b",
  completed: "#10b981",
  rejected: "#ef4444",
  cancelled: "#9ca3af",
}

const statusChartConfig = {
  requested: { label: "Requested", color: "#3b82f6" },
  accepted: { label: "Accepted", color: "#6366f1" },
  "in-progress": { label: "In progress", color: "#f59e0b" },
  completed: { label: "Completed", color: "#10b981" },
  rejected: { label: "Rejected", color: "#ef4444" },
  cancelled: { label: "Cancelled", color: "#9ca3af" },
} satisfies ChartConfig

const ROLE_COLORS: Record<Role, string> = {
  customer: "#3b82f6",
  technician: "#6366f1",
  admin: "#a855f7",
}

const roleChartConfig = {
  customer: { label: "Customer", color: ROLE_COLORS.customer },
  technician: { label: "Technician", color: ROLE_COLORS.technician },
  admin: { label: "Admin", color: ROLE_COLORS.admin },
  count: { label: "Users", color: ROLE_COLORS.customer },
} satisfies ChartConfig

const revenueChartConfig = {
  total: { label: "Revenue", color: "#10b981" },
} satisfies ChartConfig

/** Groups payments into ascending local-day buckets for the revenue chart. */
function buildRevenueData(payments: Payment[]) {
  const byDay = new Map<string, number>()
  for (const payment of payments) {
    const day = new Date(payment.paidAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    byDay.set(day, (byDay.get(day) ?? 0) + Number(payment.amount || 0))
  }
  return [...byDay.entries()].map(([day, total]) => ({ day, total })).reverse()
}

/** Admin home: platform KPIs, bookings-by-status and users-by-role charts. */
export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [payments, setPayments] = useState<Payment[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api<{ stats: AdminStats }>("/api/admin/stats"),
      api<{ payments: Payment[] }>("/api/admin/payments"),
    ])
      .then(([statsRes, paymentsRes]) => {
        if (!cancelled) {
          setStats(statsRes.stats)
          setPayments(paymentsRes.payments)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load the admin overview"
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <p className="py-16 text-center text-sm text-destructive" role="alert">
        {error}
      </p>
    )
  }

  if (stats === null || payments === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  const statusData = (Object.keys(STATUS_COLORS) as BookingStatus[])
    .map((status) => ({
      status,
      count: stats.bookings.byStatus[status] ?? 0,
    }))
    .filter((entry) => entry.count > 0)

  const roleData: { role: Role; count: number }[] = [
    { role: "customer", count: stats.users.customer },
    { role: "technician", count: stats.users.technician },
    { role: "admin", count: stats.users.admin },
  ]

  const revenueData = buildRevenueData(payments)

  const recent = stats.recentBookings

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Admin overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform health across users, services and bookings.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/dashboard/admin/services" />}
          variant="outline"
          size="sm"
        >
          <WrenchIcon /> Approval queue
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UsersIcon}
          label="Users"
          value={stats.users.total}
          hint={`${stats.users.technician} technicians · ${stats.users.customer} customers`}
        />
        <StatCard
          icon={WrenchIcon}
          label="Services"
          value={stats.services.total}
          hint={`${stats.services.pending} pending approval`}
          tone="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={CalendarIcon}
          label="Bookings"
          value={stats.bookings.total}
          hint={`${stats.bookings.byStatus.completed} completed`}
        />
        <StatCard
          icon={BanknoteIcon}
          label="Revenue"
          value={formatCurrency(stats.payments.revenue)}
          hint={`${stats.payments.totalPaid} paid`}
          tone="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Bookings by status */}
        <Card className="gap-0 py-5">
          <CardHeader>
            <CardTitle className="text-base">Bookings by status</CardTitle>
            <CardDescription>Where every request stands</CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            {statusData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nothing to chart yet.
              </p>
            ) : (
              <ChartContainer
                config={statusChartConfig}
                className="mx-auto aspect-square max-h-72"
              >
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={52}
                    outerRadius={88}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue by day */}
        <Card className="gap-0 py-5">
          <CardHeader>
            <CardTitle className="text-base">Revenue</CardTitle>
            <CardDescription>Paid amounts grouped by day</CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            {revenueData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No payments recorded yet.
              </p>
            ) : (
              <ChartContainer
                config={revenueChartConfig}
                className="h-[260px] w-full"
              >
                <BarChart
                  data={revenueData}
                  margin={{ top: 8, right: 8, bottom: 8, left: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={6}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                    width={52}
                    tickFormatter={(value: number) => formatCurrency(value)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {revenueData.map((entry) => (
                      <Cell key={entry.day} fill="#10b981" />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Users by role */}
        <Card className="gap-0 py-5">
          <CardHeader>
            <CardTitle className="text-base">Users by role</CardTitle>
            <CardDescription>Who makes up the platform</CardDescription>
          </CardHeader>
          <CardContent className="px-5">
            <ChartContainer
              config={roleChartConfig}
              className="h-[260px] w-full"
            >
              <BarChart
                data={roleData}
                layout="vertical"
                margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
              >
                <CartesianGrid horizontal={false} />
                <XAxis
                  type="number"
                  dataKey="count"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="role"
                  width={96}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={6}
                  tickFormatter={(value: string) =>
                    roleChartConfig[value as Role]?.label ?? value
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={4}>
                  {roleData.map((entry) => (
                    <Cell key={entry.role} fill={ROLE_COLORS[entry.role]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent bookings */}
      <Card className="gap-0 py-5">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent bookings</CardTitle>
            <CardDescription>The five newest requests</CardDescription>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/dashboard/admin/bookings" />}
            variant="outline"
            className="mb-1"
            size="xs"
          >
            View all
          </Button>
        </CardHeader>
        <CardContent className="px-5">
          {recent.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="No bookings yet"
              description="Requests appear here as soon as customers book a repair."
            />
          ) : (
            <div className="-mx-2 overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="max-w-44">
                        <p className="truncate font-medium">
                          {booking.serviceTitle}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {booking.category}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-36">
                        <p className="truncate text-sm">
                          {booking.customerName}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-36">
                        <p className="truncate text-sm">
                          {booking.technicianName}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(booking.createdAt)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell className="text-right text-sm whitespace-nowrap">
                        {formatCurrency(
                          booking.finalAmount ?? booking.basePrice
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
