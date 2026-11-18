import { Skeleton } from "@/components/ui/skeleton";

/** Full-page skeleton while the session resolves (prevents sign-in flash). */
export function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-60 shrink-0 border-r bg-muted/30 lg:block">
        <div className="flex h-14 items-center border-b px-4">
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="space-y-2 p-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="space-y-4 p-4 sm:p-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
