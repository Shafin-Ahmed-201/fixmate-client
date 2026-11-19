import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { HomeIcon } from "lucide-react"
import Link from "next/link"

/** Centered card shell for sign-in / sign-up (no public navbar). */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted/30">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 to-transparent"
      />
      {/* <Button
              render={<Link href="/" />}
              nativeButton={false}
              className="absolute top-4 left-4"
              variant="ghost"
              size="sm"
            >
              <HomeIcon /> Home
            </Button> */}
      {/* Auth has no navbar, so the theme switch floats in the corner. */}
      {/* <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div> */}
      <div className="relative w-full">
        <div className="flex justify-center">
          {/* <Logo /> */}
        </div>
        {children}
        <p className="text-center py-7 text-xs text-muted-foreground">
          By continuing, you agree to FixMate&apos;s terms of service and
          privacy policy.
        </p>
      </div>
    </div>
  )
}
