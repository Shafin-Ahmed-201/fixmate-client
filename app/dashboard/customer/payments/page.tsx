"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditCardIcon, ReceiptTextIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Payment } from "@/lib/types";

/** Payment history for the signed-in customer (Stripe receipts). */
export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<{ payments: Payment[] }>("/api/payments/my")
      .then((res) => {
        if (!cancelled) setPayments(res.payments);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load payments");
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

  if (payments === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  const totalSpent = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {payments.length > 0 && (
              <>
                {formatCurrency(totalSpent)} paid across {payments.length} transaction
                {payments.length === 1 ? "" : "s"}
              </>
            )}
            {payments.length === 0 && "Your Stripe payment history."}
          </p>
        </div>
        <Button render={<Link href="/dashboard/customer/bookings" />} size="sm" variant="outline">
          My bookings
        </Button>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={ReceiptTextIcon}
          title="No payments yet"
          description="When a technician completes a job you can pay securely with Stripe — receipts show up here."
        >
          <Button render={<Link href="/services" />} className="mt-4">
            <CreditCardIcon /> Book a repair
          </Button>
        </EmptyState>
      ) : (
        <div className="-mx-2 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Paid at</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="max-w-52">
                    <p className="truncate font-medium">{payment.serviceTitle}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {payment.customerName}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-36">
                    <p className="truncate text-sm">{payment.technicianName}</p>
                  </TableCell>
                  <TableCell className="max-w-44">
                    <p
                      className="truncate font-mono text-xs text-muted-foreground"
                      title={payment.transactionId ?? payment.stripeSessionId}
                    >
                      {payment.transactionId ?? payment.stripeSessionId}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {formatDateTime(payment.paidAt)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-transparent bg-emerald-500/15 font-medium text-emerald-600 capitalize dark:text-emerald-400"
                    >
                      {payment.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium whitespace-nowrap">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
