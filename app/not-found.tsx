import Link from "next/link"
import { SearchXIcon, WrenchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Repair-themed 404 page. */
export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <WrenchIcon className="size-8 text-muted-foreground" />
      </span>
      <p className="mt-6 text-5xl font-semibold tracking-tight">404</p>
      <h1 className="mt-2 text-xl font-medium">This page came loose</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back to working order.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button nativeButton={false} render={<Link href="/" />}>
          Back home
        </Button>
        <Button
          nativeButton={false}
          render={<Link href="/services" />}
          variant="outline"
        >
          <SearchXIcon /> Browse services
        </Button>
      </div>
    </div>
  )
}
