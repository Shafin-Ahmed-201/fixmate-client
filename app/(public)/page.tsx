"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CalendarCheckIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WrenchIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCard } from "@/components/service-card";
import { CATEGORIES } from "@/lib/constants";
import { api } from "@/lib/api";
import type { Service, ServiceListResponse } from "@/lib/types";

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
    icon: CreditCardIcon,
    title: "Pay securely",
    text: "Complete payment with Stripe after the job is done.",
  },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Service[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<ServiceListResponse>("/api/services", {
      auth: false,
      query: { sort: "newest", page: 1, limit: 6 },
    })
      .then((res) => {
        if (!cancelled) setFeatured(res.services);
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/8 to-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-24">
          <Badge variant="secondary" className="mb-4 border-transparent">
            <ShieldCheckIcon /> Verified local technicians
          </Badge>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Repairs done right,{" "}
            <span className="text-primary">booked in minutes</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            FixMate connects you with trusted technicians for smartphones, laptops, ACs,
            refrigerators, TVs, washing machines and electrical work — transparent pricing,
            secure payment, real reviews.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/services" />} size="lg">
              <WrenchIcon /> Browse services
            </Button>
            <Button render={<Link href="/sign-up" />} size="lg" variant="outline">
              Become a technician
            </Button>
          </div>

          <dl className="mx-auto mt-12 grid max-w-lg grid-cols-3 gap-4 text-center">
            {[
              { value: "7+", label: "Repair categories" },
              { value: "100%", label: "Secure Stripe payments" },
              { value: "24/7", label: "Booking online" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-semibold tracking-tight">{stat.value}</dt>
                <dd className="text-xs text-muted-foreground sm:text-sm">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">How FixMate works</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Three steps from problem to fixed.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card key={step.title} className="gap-0 py-5 text-center">
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

      {/* Categories */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Browse by category
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick the device or appliance you need fixed.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/services?category=${encodeURIComponent(category)}`}
                className="group flex items-center justify-between rounded-lg border bg-background p-4 text-sm font-medium transition-all hover:border-primary/40 hover:shadow-sm"
              >
                {category}
                <span className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Fresh on FixMate</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The latest approved services from our technicians.
            </p>
          </div>
          <Button render={<Link href="/services" />} variant="outline" size="sm">
            View all
          </Button>
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-primary px-6 py-10 text-center text-primary-foreground sm:flex-row sm:px-10 sm:text-left">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Are you a technician?
            </h2>
            <p className="mt-1 max-w-xl text-sm text-primary-foreground/80">
              Create a free profile, publish your services and start earning — you only
              pay Stripe&apos;s standard processing fees.
            </p>
          </div>
          <Button
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
  );
}
