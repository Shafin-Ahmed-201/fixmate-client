import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { Service } from "@/lib/types";
import { ClockIcon, MapPinIcon, WrenchIcon } from "lucide-react";
import { cn } from "cn";

/**
 * Service preview card — equal height in any grid (`h-full` on the card
 * and a flex column body so footers line up).
 */
export function ServiceCard({ service, className }: { service: Service; className?: string }) {
  return (
    <Card
      className={cn(
        "group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {service.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <WrenchIcon className="size-8" />
          </div>
        )}
        <Badge variant="secondary" className="absolute top-2 left-2 border-transparent">
          {service.category}
        </Badge>
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 p-4 pb-2">
        <h3 className="line-clamp-1 font-medium">{service.title}</h3>
        <p className="line-clamp-2 flex-1 text-sm text-muted-foreground">
          {service.description}
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3.5" /> {service.estimatedDuration}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPinIcon className="size-3.5" /> {service.serviceMode}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">by {service.technicianName}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 p-4 pt-0">
        <span className="text-lg font-semibold">{formatCurrency(service.basePrice)}</span>
        <Button render={<Link href={`/services/${service._id}`} />} size="sm" variant="outline">
          View details
        </Button>
      </CardFooter>
    </Card>
  );
}
