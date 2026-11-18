import { Logo } from "@/components/logo"

/** Centered card shell for sign-in / sign-up (no public navbar). */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-muted/30 relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div
        aria-hidden
        className="from-primary/10 pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b to-transparent"
      />
      <div className="relative w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        {children}
        <p className="text-muted-foreground text-center text-xs">
          By continuing, you agree to FixMate&apos;s terms of service and
          privacy policy.
        </p>
      </div>
    </div>
  )
}
