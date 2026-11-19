import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"
import type { Service } from "@/lib/types"
import {
  ArrowRight,
  Clock3,
  MapPin,
  Wrench,
  UserRound,
} from "lucide-react"
import { cn } from "cn"

export function ServiceCard({
  service,
  className,
}: {
  service: Service
  className?: string
}) {
  return (
    <Card
      className={cn(
        "group flex h-full flex-col gap-0 overflow-hidden rounded-2xl border border-border/70 bg-card py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl",
        className
      )}
    >
      {/* Service Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {service.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Wrench className="size-12 text-primary/50" />
          </div>
        )}

        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />

        {/* Category */}
        <Badge
          variant="secondary"
          className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur"
        >
          {service.category}
        </Badge>

        {/* Service mode */}
        <div className="absolute bottom-4 right-4">
          <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            {service.serviceMode}
          </span>
        </div>
      </div>

      {/* Content */}
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-1 text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
            {service.title}
          </h3>

          <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
            {service.description}
          </p>
        </div>

        {/* Service information */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border/60 py-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock3 className="size-4 text-primary" />
            <span>{service.estimatedDuration}</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" />
            <span>{service.serviceMode}</span>
          </div>
        </div>

        {/* Technician */}
        <div className="mt-auto flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Service provider
            </p>
            <p className="truncate text-sm font-semibold">
              {service.technicianName}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20 p-5">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Starting from</p>
          <p className="text-xl font-bold tracking-tight text-primary">
            {formatCurrency(service.basePrice)}
          </p>
        </div>

        <Button
          render={<Link href={`/services/${service._id}`} />}
          nativeButton={false}
          className="shrink-0 gap-2 rounded-xl px-4 shadow-sm transition-all group-hover:gap-3"
        >
          View Details
          <ArrowRight className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
