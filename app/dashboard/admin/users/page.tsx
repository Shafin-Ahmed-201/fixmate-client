"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronDownIcon, SearchIcon, SearchXIcon } from "lucide-react"
import { toast } from "sonner"

import { RoleBadge } from "@/components/badges"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { formatDate, initials } from "@/lib/format"
import type { Role, User } from "@/lib/types"

const ROLES: Role[] = ["customer", "technician", "admin"]

/** Admin users: search accounts and change roles (never your own). */
export default function AdminUsersPage() {
  const { data: session } = authClient.useSession()
  const myId = session?.user?.id

  const [users, setUsers] = useState<User[] | null>(null)
  const [query, setQuery] = useState("")
  const [target, setTarget] = useState<{ user: User; role: Role } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    api<{ users: User[] }>("/api/admin/users")
      .then((res) => setUsers(res.users))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load users")
      )
  }, [])

  useEffect(load, [load])

  async function handleRoleChange() {
    if (!target) return
    setBusy(true)
    try {
      await api(`/api/admin/users/${target.user._id}/role`, {
        method: "PATCH",
        body: { role: target.role },
      })
      toast.success("Role updated")
      setTarget(null)
      load()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update the role"
      )
    } finally {
      setBusy(false)
    }
  }

  if (error) {
    return (
      <p className="text-destructive py-16 text-center text-sm" role="alert">
        {error}
      </p>
    )
  }

  if (users === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  const search = query.trim().toLowerCase()
  const visible = search
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search)
      )
    : users

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {users.length} registered account{users.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Client-side search */}
      <div className="relative max-w-sm">
        <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or email…"
          className="pl-9"
          aria-label="Search users"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={SearchXIcon}
          title="No users found"
          description={
            search
              ? "Try a different name or email address."
              : "No accounts have registered yet."
          }
        >
          {search && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setQuery("")}
            >
              Clear search
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="-mx-2 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-44 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((user) => {
                const isSelf = user._id === myId
                return (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          {user.image && (
                            <AvatarImage src={user.image} alt={user.name} />
                          )}
                          <AvatarFallback>{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{user.name}</p>
                          <p className="text-muted-foreground truncate text-xs">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {user.phone || "—"}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isSelf ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          title="You cannot change your own role"
                        >
                          Change role <ChevronDownIcon />
                        </Button>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button size="sm" variant="outline" />}
                            aria-label={`Change role for ${user.name}`}
                          >
                            Change role <ChevronDownIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Set role</DropdownMenuLabel>
                            {ROLES.map((role) => (
                              <DropdownMenuItem
                                key={role}
                                disabled={user.role === role}
                                onClick={() => setTarget({ user, role })}
                              >
                                {role}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
        title={target ? `Change ${target.user.name}'s role?` : ""}
        description={
          target
            ? `They will immediately gain access to the ${target.role} dashboard.`
            : ""
        }
        confirmLabel="Change role"
        cancelLabel="Cancel"
        destructive={false}
        onConfirm={handleRoleChange}
        disabled={busy}
      />
    </div>
  )
}
