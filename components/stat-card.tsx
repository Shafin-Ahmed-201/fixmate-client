import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "cn"

/** KPI tile for dashboard overviews. */
export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "text-primary",
}: {
  icon: LucideIcon
  label: string
  value: string | number
  hint?: string
  tone?: string
}) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="flex items-center gap-3 px-4">
        <span
          className={cn(
            "bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg",
            tone
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-muted-foreground truncate text-sm">{label}</p>
          <p className="text-xl font-semibold tracking-tight">{value}</p>
          {hint && (
            <p className="text-muted-foreground truncate text-xs">{hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
