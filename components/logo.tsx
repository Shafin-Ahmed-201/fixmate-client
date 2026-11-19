import Image from "next/image"
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
      <span className="bg-white text-primary-foreground flex size-8 items-center justify-center rounded-lg shadow-sm">
        <Image
          src="/images/logo.png"
          alt=""
          aria-hidden="true"
          width={32}
          height={32}
          className="size-full object-contain"
        />
      </span>
      <span className={cn("text-lg", textClassName)}>
        Fix<span className="text-primary">Mate</span>
      </span>
    </Link>
  )
}
