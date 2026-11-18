"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2Icon,
  ClockIcon,
  HomeIcon,
  Loader2Icon,
  ReceiptTextIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Payment } from "@/lib/types";

type VerifyState =
  | { kind: "checking" }
  | { kind: "paid"; payment: Payment | null; alreadyPaid: boolean }
  | { kind: "pending" }
  | { kind: "failed"; message: string }
  | { kind: "no-session" };

/** Stripe return page — verifies the session and records the payment server-side. */
export default function PaymentSuccessPage() {
  const [state, setState] = useState<VerifyState>({ kind: "checking" });

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setState({ kind: "no-session" });
      return;
    }

    let cancelled = false;
    api<{ paid: boolean; alreadyPaid?: boolean; payment?: Payment | null; message?: string }>(
      "/api/payments/verify",
      { query: { session_id: sessionId } }
    )
      .then((res) => {
        if (cancelled) return;
        if (res.paid) {
          setState({ kind: "paid", payment: res.payment ?? null, alreadyPaid: Boolean(res.alreadyPaid) });
        } else {
          setState({ kind: "pending" });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            kind: "failed",
            message: err instanceof Error ? err.message : "Could not verify this payment",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg gap-0 py-8">
        <CardContent className="flex flex-col items-center px-8 text-center">
          {state.kind === "checking" && (
            <>
              <Loader2Icon className="size-12 animate-spin text-primary" />
              <h1 className="mt-4 text-xl font-medium">Confirming your payment…</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Hang tight while we verify the transaction with Stripe.
              </p>
            </>
          )}

          {state.kind === "paid" && (
            <>
              <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle2Icon className="size-8 text-emerald-600 dark:text-emerald-400" />
              </span>
              <h1 className="mt-4 text-xl font-medium">Payment successful!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {state.alreadyPaid
                  ? "This payment was already recorded — you're all set."
                  : "Thank you — your receipt is now available in your payment history."}
              </p>
              {state.payment && (
                <dl className="mt-5 w-full space-y-2 rounded-lg border bg-muted/30 p-4 text-left text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Service</dt>
                    <dd className="truncate font-medium">{state.payment.serviceTitle}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-medium">{formatCurrency(state.payment.amount)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Paid at</dt>
                    <dd className="font-medium">{formatDateTime(state.payment.paidAt)}</dd>
                  </div>
                  {state.payment.transactionId && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Transaction</dt>
                      <dd className="truncate font-mono text-xs" title={state.payment.transactionId}>
                        {state.payment.transactionId}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button render={<Link href="/dashboard/customer/payments" />}>
                  <ReceiptTextIcon /> View receipts
                </Button>
                <Button render={<Link href="/" />} variant="outline">
                  <HomeIcon /> Back home
                </Button>
              </div>
            </>
          )}

          {state.kind === "pending" && (
            <>
              <span className="flex size-16 items-center justify-center rounded-full bg-amber-500/15">
                <ClockIcon className="size-8 text-amber-600 dark:text-amber-400" />
              </span>
              <h1 className="mt-4 text-xl font-medium">Payment not completed</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                It looks like the checkout wasn&apos;t finished. You can retry from your
                bookings page.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button render={<Link href="/dashboard/customer/bookings" />}>
                  Back to bookings
                </Button>
                <Button render={<Link href="/" />} variant="outline">
                  <HomeIcon /> Back home
                </Button>
              </div>
            </>
          )}

          {(state.kind === "failed" || state.kind === "no-session") && (
            <>
              <span className="flex size-16 items-center justify-center rounded-full bg-muted">
                <ReceiptTextIcon className="size-8 text-muted-foreground" />
              </span>
              <h1 className="mt-4 text-xl font-medium">Nothing to verify</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {state.kind === "failed"
                  ? state.message
                  : "This page is only shown after a Stripe checkout. Pick a service to get started."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button render={<Link href="/services" />}>Browse services</Button>
                <Button render={<Link href="/" />} variant="outline">
                  <HomeIcon /> Back home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
