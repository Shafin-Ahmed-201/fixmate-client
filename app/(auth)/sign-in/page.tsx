"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Home,
  HomeIcon,
  Loader2Icon,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Wrench,
} from "lucide-react"
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
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

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

  const googleSignIn = async () => {
    const data = await authClient.signIn.social({
      provider: "google",
    })
  }

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-4 py-12">
      <Button
              render={<Link href="/" />}
              nativeButton={false}
              className="absolute top-4 left-4"
              variant="ghost"
              size="sm"
            >
              <HomeIcon /> Home
            </Button>
      {/* Auth has no navbar, so the theme switch floats in the corner. */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white bg-white shadow-2xl shadow-slate-300/40 lg:grid-cols-2">

        {/* Left promotional panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#102A56] via-[#164A87] to-[#087EAA] p-10 text-white lg:flex">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full border-[50px] border-white/5" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#14518C] shadow-lg">
            
               <Image
          src="/images/logo.png"
          alt=""
          aria-hidden="true"
          width={32}
          height={32}
          className="size-full object-contain"
        />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                FixMate
              </h2>
              <p className="text-xs tracking-widest text-blue-100">
                SMART REPAIR SOLUTIONS
              </p>
            </div>
          </div>

          {/* Main content */}
          <div className="relative z-10 my-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-cyan-100 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4" />
              Reliable service. Trusted professionals.
            </span>

            <h1 className="mt-7 text-4xl font-bold leading-tight xl:text-5xl">
              Every repair
              <br />
              starts with
              <span className="text-cyan-300"> FixMate.</span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-blue-100">
              Find skilled professionals, book reliable home services,
              and keep track of every repair request — all in one place.
            </p>

            <div className="mt-9 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <ShieldCheck className="h-5 w-5 text-cyan-300" />
                </div>
                <span className="text-sm text-blue-50">
                  Trusted service professionals
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Home className="h-5 w-5 text-cyan-300" />
                </div>
                <span className="text-sm text-blue-50">
                  Convenient home repair booking
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <CheckCircle2 className="h-5 w-5 text-cyan-300" />
                </div>
                <span className="text-sm text-blue-50">
                  Easy booking and payment tracking
                </span>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-blue-200">
            © {new Date().getFullYear()} FixMate. All rights reserved.
          </p>
        </div>

        {/* Right sign-in section */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-white shadow-md">
                   <Image
                          src="/images/logo.png"
                          alt=""
                          aria-hidden="true"
                          width={32}
                          height={32}
                          className="size-full object-contain"
                        />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#102A56]">
                  FixMate
                </h2>
                <p className="text-[10px] font-medium tracking-widest text-slate-500">
                  SMART REPAIR SOLUTIONS
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">
                Welcome back
              </p>

              <h2 className="text-3xl font-extrabold tracking-tight text-[#102A56] sm:text-4xl">
                Sign in to your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Access your FixMate account and manage your home repair
                services with ease.
              </p>
            </div>

            {/* Form */}
            <Card className="gap-0 border-0 bg-transparent py-0 shadow-none">
              <CardHeader className="hidden">
                <CardTitle>Sign in</CardTitle>
                <CardDescription>
                  Sign in to your FixMate account
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Email address
                    </Label>

                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={loading}
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 text-slate-800 transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Password
                    </Label>

                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={loading}
                        className="h-12 rounded-xl border-slate-200 bg-slate-50 pl-11 text-slate-800 transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* Email sign-in button */}
                  <Button
                    type="submit"
                    className="group h-12 w-full rounded-xl bg-gradient-to-r from-[#164A87] to-[#087EAA] text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:from-[#103B70] hover:to-[#066B91] hover:shadow-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Or continue with
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  {/* Google sign-in */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => googleSignIn()}
                    className="h-12 w-full rounded-xl border-slate-200 bg-white font-semibold text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50"
                    disabled={loading}
                  >
                    <svg
                      className="mr-2 h-5 w-5"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 3.03 13.22l7.98 6.19C12.9 13.72 18.02 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.99 46.98 31.92 46.98 24.55z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.99 28.59A14.4 14.4 0 0 1 10.2 24c0-1.59.28-3.13.78-4.59L3 13.22A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 3 10.78l7.99-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.89 2.3-8.18 2.3-5.98 0-11.1-4.22-12.93-9.91l-7.99 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </form>

                {/* Sign-up link */}
                <p className="mt-7 text-center text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/sign-up"
                    className="font-bold text-blue-700 transition-colors hover:text-cyan-600 hover:underline"
                  >
                    Create an account
                  </Link>
                </p>

                {/* Security note */}
                <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Secure sign-in powered by FixMate
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
