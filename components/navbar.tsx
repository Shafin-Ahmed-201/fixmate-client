"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/logo"
import { RoleBadge } from "@/components/badges"
import { authClient } from "@/lib/auth-client"
import { invalidateToken } from "@/lib/api"
import { dashboardHome } from "@/lib/constants"
import { initials } from "@/lib/format"
import type { Role } from "@/lib/types"
import {
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
]

/** Sticky public navbar: logo, links, auth-aware avatar dropdown, mobile menu. */
export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const user = session?.user
  const dashboardHref = user ? dashboardHome(user.role as Role) : "/sign-in"

  async function handleSignOut() {
    await authClient.signOut()
    invalidateToken()
    setMobileOpen(false)
    router.push("/")
    router.refresh()
  }

  const linkClass = (href: string) =>
    cn(
      "text-muted-foreground hover:text-foreground text-sm font-medium transition-colors",
      (href === "/" ? pathname === "/" : pathname.startsWith(href)) &&
        "text-foreground"
    )

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="focus-visible:ring-ring flex items-center gap-2 rounded-full outline-none focus-visible:ring-2">
                <Avatar className="size-8">
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="max-w-28 truncate text-sm font-medium">
                  {user.name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate">{user.name}</span>
                    <RoleBadge role={user.role as Role} />
                  </span>
                  <span className="text-muted-foreground truncate text-xs font-normal">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(dashboardHref)}
                  className="gap-2"
                >
                  <LayoutDashboardIcon className="size-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                  className="gap-2"
                >
                  <UserIcon className="size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  variant="destructive"
                  className="gap-2"
                >
                  <LogOutIcon className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                render={<Link href="/sign-in" />}
                variant="ghost"
                size="sm"
              >
                Sign in
              </Button>
              <Button render={<Link href="/sign-up" />} size="sm">
                Get started
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <XIcon /> : <MenuIcon />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="bg-background border-t px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.href)}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-2 border-t pt-3">
            {user ? (
              <>
                <Button
                  render={<Link href={dashboardHref} />}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button
                  render={<Link href="/sign-in" />}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </Button>
                <Button
                  render={<Link href="/sign-up" />}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMobileOpen(false)}
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
