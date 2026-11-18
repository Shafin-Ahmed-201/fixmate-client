"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckIcon, Loader2Icon, UserIcon, WrenchIcon } from "lucide-react";
import { toast } from "sonner";

import { invalidateToken } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { dashboardHome } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "cn";

const ROLE_OPTIONS = [
  {
    value: "customer" as const,
    title: "Customer",
    description: "Book repairs & track requests",
    icon: UserIcon,
  },
  {
    value: "technician" as const,
    title: "Technician",
    description: "Offer services & earn money",
    icon: WrenchIcon,
  },
];

const passwordRules = [
  { label: "At least 6 characters", test: (v: string) => v.length >= 6 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
];

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [loading, setLoading] = useState(false);

  // Already signed in → skip the form.
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(dashboardHome(session.user.role as Role));
    }
  }, [isPending, session, router]);

  const rulesPassed = passwordRules.every((rule) => rule.test(password));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (name.trim().length < 2) return toast.error("Please enter your name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return toast.error("Please enter a valid email");
    if (!rulesPassed) return toast.error("Password does not meet the requirements");
    if (password !== confirm) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      if (result.error) {
        toast.error(result.error.message || "Sign up failed");
        return;
      }

      invalidateToken();
      toast.success(`Welcome to FixMate, ${name.trim().split(" ")[0]}!`);
      router.push(dashboardHome(role));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="gap-0 py-6 shadow-sm">
      <CardHeader className="gap-1 pb-4">
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>
          Join FixMate as a customer or a service technician — it&apos;s free.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <fieldset className="space-y-1.5" disabled={loading}>
            <legend className="text-sm font-medium">I am a…</legend>
            <div className="grid grid-cols-2 gap-3 pt-1.5">
              {ROLE_OPTIONS.map((option) => {
                const selected = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRole(option.value)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-input bg-background hover:bg-muted"
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <option.icon
                        className={cn("size-4", selected ? "text-primary" : "text-muted-foreground")}
                      />
                      {option.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Jane Doe"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={loading}
            />
          </div>

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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
            />
            <ul className="grid gap-1 pt-1">
              {passwordRules.map((rule) => {
                const passed = rule.test(password);
                return (
                  <li
                    key={rule.label}
                    className={cn(
                      "flex items-center gap-1.5 text-xs",
                      passed ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    )}
                  >
                    <CheckIcon
                      className={cn("size-3.5", !passed && "opacity-30")}
                      aria-hidden
                    />
                    {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              disabled={loading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2Icon className="animate-spin" />}
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
