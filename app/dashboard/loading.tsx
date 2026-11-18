import { Skeleton } from "@/components/ui/skeleton"

/** Content skeleton while a dashboard route loads (shell stays mounted). */
export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-56" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-lg" />
    </div>
  )
}
