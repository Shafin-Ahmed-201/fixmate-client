import type { Metadata } from "next"
import {
  BadgeCheckIcon,
  HandshakeIcon,
  RecycleIcon,
  ShieldCheckIcon,
  TargetIcon,
  UsersIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how FixMate connects customers with verified local repair technicians — transparent, secure and affordable.",
}

const VALUES = [
  {
    icon: BadgeCheckIcon,
    title: "Verified technicians",
    text: "Every technician builds a public profile with real services, prices and areas — reviewed by our team before going live.",
  },
  {
    icon: HandshakeIcon,
    title: "Transparent pricing",
    text: "Base prices are published up front. The final amount is agreed with you before any work begins — no surprise fees.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure payments",
    text: "Pay through Stripe after the job is completed. Your card details never touch our servers.",
  },
  {
    icon: RecycleIcon,
    title: "Repair, don't replace",
    text: "Fixing devices keeps electronics out of landfills and saves you the cost of a replacement.",
  },
]

const FACTS = [
  { value: "7+", label: "Repair categories" },
  { value: "3", label: "Customer, technician & admin roles" },
  { value: "100%", label: "Stripe-secured checkout" },
  { value: "0", label: "Booking fees for customers" },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="max-w-3xl">
        <Badge variant="secondary" className="mb-4 border-transparent">
          <TargetIcon /> About FixMate
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          The repair marketplace built for everyday devices
        </h1>
        <p className="text-muted-foreground mt-4 leading-relaxed text-pretty">
          FixMate started with a simple frustration: finding an honest
          technician for a cracked phone screen or a dead refrigerator took
          hours of phone calls and guess about pricing. We built a platform
          where customers browse real services with published prices, book in
          under a minute, and pay only when the work is done — and where
          technicians grow a business on their own terms.
        </p>
      </div>

      {/* Facts */}
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {FACTS.map((fact) => (
          <Card key={fact.label} className="gap-0 py-5 text-center">
            <CardContent className="px-4">
              <p className="text-2xl font-semibold tracking-tight">
                {fact.value}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">{fact.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Values */}
      <div className="mt-14">
        <h2 className="text-xl font-semibold tracking-tight">
          What we stand for
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {VALUES.map((value) => (
            <Card key={value.title} className="gap-0 py-5">
              <CardContent className="flex gap-4 px-5">
                <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <value.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-medium">{value.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {value.text}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="bg-muted/30 mt-14 rounded-2xl border p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <UsersIcon className="text-primary size-5" />
          <h2 className="text-xl font-semibold tracking-tight">
            Three roles, one platform
          </h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            {
              role: "Customers",
              text: "Browse services, request bookings, track status and pay securely with Stripe.",
            },
            {
              role: "Technicians",
              text: "Publish services with images and pricing, accept requests and manage jobs end to end.",
            },
            {
              role: "Admins",
              text: "Review service approvals, moderate users and monitor every booking and transaction.",
            },
          ].map((item) => (
            <div
              key={item.role}
              className="bg-background rounded-lg border p-4"
            >
              <p className="text-sm font-semibold">{item.role}</p>
              <p className="text-muted-foreground mt-1 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
