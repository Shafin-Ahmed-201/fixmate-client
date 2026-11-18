"use client"

import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Global error boundary with a retry action. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="bg-destructive/10 flex size-16 items-center justify-center rounded-2xl">
        <AlertTriangleIcon className="text-destructive size-8" />
      </span>
      <h1 className="mt-6 text-xl font-medium">Something went wrong</h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {error.message ||
          "An unexpected error occurred while rendering this page."}
      </p>
      <Button onClick={reset} className="mt-6">
        <RefreshCwIcon /> Try again
      </Button>
    </div>
  )
}
