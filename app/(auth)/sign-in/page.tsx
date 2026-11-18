"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { invalidateToken } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { dashboardHome } from "@/lib/constants"
import type { Role } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignInPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Already signed in → skip the form.
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(dashboardHome(session.user.role as Role))
    }
  }, [isPending, session, router])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password")
      return
    }

    setLoading(true)
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      })
      if (result.error) {
        toast.error(result.error.message || "Sign in failed")
        return
      }

      invalidateToken()
      const redirect = new URLSearchParams(window.location.search).get(
        "redirect"
      )
      const role = (result.data?.user?.role as Role) || "customer"
      toast.success("Welcome back!")
      router.push(redirect || dashboardHome(role))
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="gap-0 py-6 shadow-sm">
      <CardHeader className="gap-1 pb-4">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to book repairs and track your requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2Icon className="animate-spin" />}
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-muted-foreground mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
