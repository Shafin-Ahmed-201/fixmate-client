"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  CheckIcon,
  CheckCircle2,
  Loader2Icon,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserIcon,
  UserRound,
  WrenchIcon,
  HomeIcon,
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
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

const ROLE_OPTIONS = [
  {
    value: "customer" as const,
    title: "Customer",
    description: "Book repairs & track requests",
    icon: UserIcon,
    color: "blue",
  },
  {
    value: "technician" as const,
    title: "Technician",
    description: "Offer services & earn money",
    icon: WrenchIcon,
    color: "cyan",
  },
]

const passwordRules = [
  { label: "At least 6 characters", test: (v: string) => v.length >= 6 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
]

export default function SignUpPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [role, setRole] = useState<Role>("customer")
  const [loading, setLoading] = useState(false)

  // Already signed in → skip the form.
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(dashboardHome(session.user.role as Role))
    }
  }, [isPending, session, router])

  const rulesPassed = passwordRules.every((rule) => rule.test(password))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (name.trim().length < 2) return toast.error("Please enter your name")
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return toast.error("Please enter a valid email")
    if (!rulesPassed)
      return toast.error("Password does not meet the requirements")
    if (password !== confirm) return toast.error("Passwords do not match")

    setLoading(true)
    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      })

      if (result.error) {
        toast.error(result.error.message || "Sign up failed")
        return
      }

      invalidateToken()
      toast.success(`Welcome to FixMate, ${name.trim().split(" ")[0]}!`)
      router.push(dashboardHome(role))
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-4 py-10">
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

          {/* Brand */}
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

          {/* Promotional content */}
          <div className="relative z-10 my-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-cyan-100 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4" />
              Your trusted repair partner
            </span>

            <h1 className="mt-7 text-4xl font-bold leading-tight xl:text-5xl">
              Join FixMate.
              <br />
              Make every
              <span className="text-cyan-300"> repair easier.</span>
            </h1>

            <p className="mt-5 max-w-sm text-sm leading-7 text-blue-100">
              Whether you need a repair or want to offer professional
              services, FixMate connects people with the right solutions.
            </p>

            {/* Benefits */}
            <div className="mt-9 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <UserRound className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold">For Customers</p>
                  <p className="text-xs text-blue-200">
                    Find and book trusted technicians.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <WrenchIcon className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold">For Technicians</p>
                  <p className="text-xs text-blue-200">
                    Grow your business and reach customers.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Simple & Secure</p>
                  <p className="text-xs text-blue-200">
                    Manage your account with confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-blue-200">
            © {new Date().getFullYear()} FixMate. All rights reserved.
          </p>
        </div>

        {/* Right sign-up section */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-12">

          <div className="w-full max-w-md">

            {/* Mobile brand */}
            <div className="mb-7 flex items-center gap-3 lg:hidden">
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
            <div className="mb-6">
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-600">
                Get started today
              </p>

              <h2 className="text-3xl font-extrabold tracking-tight text-[#102A56] sm:text-4xl">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Join FixMate and discover a smarter way to manage home repairs.
              </p>
            </div>

            <Card className="gap-0 border-0 bg-transparent py-0 shadow-none">
              <CardHeader className="hidden">
                <CardTitle>Create your account</CardTitle>
                <CardDescription>
                  Join FixMate as a customer or technician.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Role selection */}
                  <fieldset className="space-y-2" disabled={loading}>
                    <legend className="text-sm font-semibold text-slate-700">
                      Choose your account type
                    </legend>

                    <div className="grid grid-cols-2 gap-3">
                      {ROLE_OPTIONS.map((option) => {
                        const selected = role === option.value
                        const Icon = option.icon

                        return (
                          <button
                            key={option.value}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setRole(option.value)}
                            className={cn(
                              "relative rounded-xl border p-3 text-left transition-all duration-200",
                              selected
                                ? "border-blue-500 bg-blue-50/80 ring-2 ring-blue-100"
                                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                            )}
                          >
                            {selected && (
                              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                                <CheckIcon className="h-3 w-3" />
                              </span>
                            )}

                            <span
                              className={cn(
                                "mb-3 flex h-9 w-9 items-center justify-center rounded-lg",
                                selected
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-500"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </span>

                            <span className="block text-sm font-bold text-[#102A56]">
                              {option.title}
                            </span>

                            <span className="mt-1 block pr-1 text-[11px] leading-4 text-slate-500">
                              {option.description}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>

                  {/* Full name */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Full name
                    </Label>

                    <div className="relative">
                      <UserRound className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="name"
                        autoComplete="name"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={loading}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-slate-800 transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
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
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-slate-800 transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
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
                        autoComplete="new-password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        disabled={loading}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-slate-800 transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-100"
                      />
                    </div>

                    {/* Password requirements */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <p className="mb-2 text-xs font-semibold text-slate-600">
                        Password requirements
                      </p>

                      <ul className="grid gap-1.5 sm:grid-cols-2">
                        {passwordRules.map((rule) => {
                          const passed = rule.test(password)

                          return (
                            <li
                              key={rule.label}
                              className={cn(
                                "flex items-center gap-1.5 text-xs transition-colors",
                                passed
                                  ? "font-medium text-emerald-600"
                                  : "text-slate-400"
                              )}
                            >
                              <CheckIcon
                                className={cn(
                                  "h-3.5 w-3.5",
                                  !passed && "opacity-30"
                                )}
                                aria-hidden
                              />
                              {rule.label}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="confirm"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Confirm password
                    </Label>

                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="confirm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        disabled={loading}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-11 text-slate-800 transition-all placeholder:text-slate-400 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-100"
                      />
                    </div>

                    {confirm.length > 0 && (
                      <p
                        className={cn(
                          "flex items-center gap-1.5 text-xs",
                          password === confirm
                            ? "text-emerald-600"
                            : "text-rose-500"
                        )}
                      >
                        {password === confirm ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : null}
                        {password === confirm
                          ? "Passwords match"
                          : "Passwords do not match"}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="group h-12 w-full rounded-xl bg-gradient-to-r from-[#164A87] to-[#087EAA] text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:from-[#103B70] hover:to-[#066B91] hover:shadow-xl"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create your account
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Sign-in link */}
                <p className="mt-6 text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="font-bold text-blue-700 transition-colors hover:text-cyan-600 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>

                {/* Security note */}
                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Your account is protected with secure authentication.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
