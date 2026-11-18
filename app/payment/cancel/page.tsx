import Link from "next/link";
import { HomeIcon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Stripe checkout cancellation return page. */
export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-lg gap-0 py-8">
        <CardContent className="flex flex-col items-center px-8 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-red-500/15">
            <XCircleIcon className="size-8 text-red-600 dark:text-red-400" />
          </span>
          <h1 className="mt-4 text-xl font-medium">Checkout cancelled</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No charge was made. Your booking is still marked as unpaid — you can retry
            whenever you&apos;re ready.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button render={<Link href="/dashboard/customer/bookings" />}>
              Back to bookings
            </Button>
            <Button render={<Link href="/" />} variant="outline">
              <HomeIcon /> Back home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
