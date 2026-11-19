"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowUpRight,
  CalendarCheckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WrenchIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ServiceCard } from "@/components/service-card"
import { CATEGORIES } from "@/lib/constants"
import { api } from "@/lib/api"
import type { Service, ServiceListResponse } from "@/lib/types"
import HeroSection from "@/components/hero-section"
import CategorySection from "@/components/category-section"

const STEPS = [
  {
    icon: SparklesIcon,
    title: "Pick a service",
    text: "Browse verified technicians by category, price and availability.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Book a visit",
    text: "Choose a preferred date and describe the problem in seconds.",
  },
  {
    icon: WrenchIcon,
    title: "Track the job",
    text: "Follow every status change live — requested, accepted, in progress.",
  },
  {
    icon: CreditCardIcon,
    title: "Pay securely",
    text: "Complete payment with Stripe only after the job is done.",
  },
]

export default function HomePage() {
  const [featured, setFeatured] = useState<Service[] | null>(null)

  useEffect(() => {
    let cancelled = false
    api<ServiceListResponse>("/api/services", {
      auth: false,
      query: { sort: "newest", page: 1, limit: 6 },
    })
      .then((res) => {
        if (!cancelled) setFeatured(res.services)
      })
      .catch(() => {
        if (!cancelled) setFeatured([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      {/* Hero */}
      <HeroSection></HeroSection>

      {/* Categories */}
      <CategorySection></CategorySection>

      {/* Featured services */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Fresh on FixMate
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The latest approved services from our technicians.
            </p>
          </div>
            {/* Bottom CTA */}
    <div className="mt-10 text-center">
      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3"
      >
        Explore all services
        <ArrowUpRight className="size-4" />
      </Link>
    </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured === null
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-4">
                  <Skeleton className="aspect-video w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))
            : featured.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
        </div>

        {featured?.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No services published yet — check back soon.
          </p>
        )}
      </section>

         {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            How FixMate works
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Four steps from problem to fixed.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <Card
              key={step.title}
              className="gap-0 py-5 text-center transition-shadow hover:shadow-sm"
            >
              <CardContent className="flex flex-col items-center gap-2 px-5">
                <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Step {index + 1}
                </span>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-primary px-6 py-10 text-center text-primary-foreground sm:flex-row sm:px-10 sm:text-left">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Are you a technician?
            </h2>
            <p className="mt-1 max-w-xl text-sm text-primary-foreground/80">
              Create a free profile, publish your services and start earning —
              you only pay Stripe&apos;s standard processing fees.
            </p>
          </div>
          <Button
            nativeButton={false}
            render={<Link href="/sign-up" />}
            size="lg"
            variant="secondary"
            className="shrink-0"
          >
            Join as a technician
          </Button>
        </div>
      </section>
    </>
  )
}
