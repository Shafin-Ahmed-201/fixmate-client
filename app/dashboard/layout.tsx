"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  CalendarIcon,
  ChevronDownIcon,
  CreditCardIcon,
  HomeIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  PlusSquareIcon,
  UserIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react"

import { Logo } from "@/components/logo"
import { RoleBadge } from "@/components/badges"
import { ThemeToggle } from "@/components/theme-toggle"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { invalidateToken } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { dashboardHome } from "@/lib/constants"
import { initials } from "@/lib/format"
import type { Role } from "@/lib/types"
import { cn } from "cn"

interface NavLink {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV: Record<Role, NavLink[]> = {
  customer: [
    {
      href: "/dashboard/customer",
      label: "Overview",
      icon: LayoutDashboardIcon,
    },
    {
      href: "/dashboard/customer/bookings",
      label: "My bookings",
      icon: CalendarIcon,
    },
    {
      href: "/dashboard/customer/payments",
      label: "Payments",
      icon: CreditCardIcon,
    },
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
  ],
  technician: [
    {
      href: "/dashboard/technician",
      label: "Overview",
      icon: LayoutDashboardIcon,
    },
    {
      href: "/dashboard/technician/add-service",
      label: "Add service",
      icon: PlusSquareIcon,
    },
    {
      href: "/dashboard/technician/my-services",
      label: "My services",
      icon: WrenchIcon,
    },
    {
      href: "/dashboard/technician/requests",
      label: "Requests",
      icon: InboxIcon,
    },
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboardIcon },
    { href: "/dashboard/admin/users", label: "Users", icon: UsersIcon },
    { href: "/dashboard/admin/services", label: "Services", icon: WrenchIcon },
    {
      href: "/dashboard/admin/bookings",
      label: "Bookings",
      icon: CalendarIcon,
    },
    {
      href: "/dashboard/admin/transactions",
      label: "Transactions",
      icon: CreditCardIcon,
    },
    { href: "/dashboard/profile", label: "Profile", icon: UserIcon },
  ],
}

function NavItems({
  role,
  pathname,
  onNavigate,
}: {
  role: Role
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="space-y-1" aria-label="Dashboard">
      {NAV[role].map((link) => {
        const active = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <link.icon className="size-4" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

/** Protected dashboard shell: role sidebar, topbar, session guard. */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const user = session?.user
  const role = (user?.role as Role) ?? "customer"
  const home = dashboardHome(role)

  // Sign-in guard + role-based route guard (redirect, never flash wrong content).
  useEffect(() => {
    if (isPending) return
    if (!user) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    const allowed =
      pathname === "/dashboard" ||
      pathname === "/dashboard/profile" ||
      pathname.startsWith(home)
    if (!allowed) router.replace(home)
  }, [isPending, user, pathname, home, router])

  if (isPending || !user) return <DashboardSkeleton />

  const allowed =
    pathname === "/dashboard" ||
    pathname === "/dashboard/profile" ||
    pathname.startsWith(home)
  if (!allowed) return <DashboardSkeleton />

  async function handleSignOut() {
    await authClient.signOut()
    invalidateToken()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/40 lg:flex">
        <div className="flex h-14 items-center border-b px-4">
          <Logo href={home} />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavItems role={role} pathname={pathname} />
        </div>
        <div className="border-t p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-background p-2.5 shadow-sm">
            <Avatar className="size-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <RoleBadge role={role} className="mt-0.5" />
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Sign out"
              onClick={handleSignOut}
            >
              <LogOutIcon />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6">
          {/* Mobile nav */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open navigation"
                />
              }
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="border-b">
                <SheetTitle>
                  <Logo href={home} />
                </SheetTitle>
              </SheetHeader>
              <div className="p-3">
                <NavItems
                  role={role}
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
              <div className="border-t p-3">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name}
                    />
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <RoleBadge role={role} className="mt-0.5" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Sign out"
                    onClick={handleSignOut}
                  >
                    <LogOutIcon />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="lg:hidden">
            <Logo href={home} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />

            <Button
              render={<Link href="/" />}
              nativeButton={false}
              variant="ghost"
              size="sm"
            >
              <HomeIcon /> Home
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="size-8">
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback>{initials(user.name)}</AvatarFallback>
                </Avatar>
                <span className="hidden flex-col items-start leading-tight sm:flex">
                  <span className="max-w-40 truncate text-sm font-medium">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {role}
                  </span>
                </span>
                <ChevronDownIcon className="hidden size-3.5 text-muted-foreground sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate">{user.name}</span>
                      <RoleBadge role={role} />
                    </span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/dashboard/profile")}
                  className="gap-2"
                >
                  <UserIcon className="size-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(home)}
                  className="gap-2"
                >
                  <LayoutDashboardIcon className="size-4" /> Dashboard
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
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  )
}
