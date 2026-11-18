import { WrenchIcon } from "lucide-react"
import Link from "next/link"
import { cn } from "cn"

/** Consistent FixMate logo used in the navbar, footer and auth pages. */
export function Logo({
  className,
  href = "/",
  textClassName,
}: {
  className?: string
  href?: string
  textClassName?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 font-semibold tracking-tight",
        className
      )}
    >
      <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg shadow-sm">
        <WrenchIcon className="size-4.5" />
      </span>
      <span className={cn("text-lg", textClassName)}>
        Fix<span className="text-primary">Mate</span>
      </span>
    </Link>
  )
}
