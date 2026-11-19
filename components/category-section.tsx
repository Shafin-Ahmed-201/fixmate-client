
import Link from "next/link"
import {
  ArrowUpRight,
  Laptop,
  Smartphone,
  Refrigerator,
  WashingMachine,
  Tv,
  AirVent,
  Zap,
  Wrench,
} from "lucide-react"
import { CATEGORIES } from "@/lib/constants"
import { Badge } from "./ui/badge"

// Category icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Smartphone": Smartphone,
  "Laptop & PC": Laptop,
  "Refrigerator": Refrigerator,
  "Washing Machine": WashingMachine,
  "TV": Tv,
  "AC": AirVent,
  "Electrical": Zap,
}
import React from 'react';

const CategorySection = () => {
    return (
        <div>
            {/* Browse by Category */}
<section className="relative overflow-hidden border-t bg-gradient-to-b from-muted/50 to-background">
  <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">

    {/* Section Heading */}
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <Badge className="mb-3 rounded-full px-4 py-1">
        Explore Services
      </Badge>

      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Find the Right <span className="text-primary">Repair Service</span>
      </h2>

      <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
        Browse our service categories and find trusted professionals
        to fix your devices and home appliances.
      </p>
    </div>

    {/* Category Grid */}
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {CATEGORIES.map((category) => {
        const Icon = CATEGORY_ICONS[category] || Wrench

        return (
          <Link
            key={category}
            href={`/services?category=${encodeURIComponent(category)}`}
            className="group relative flex min-h-36 flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            {/* Decorative background */}
            <div className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />

            <div className="relative flex items-start justify-between">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-6" />
              </div>

              <div className="flex size-8 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowUpRight className="size-4 transition-transform group-hover:rotate-45" />
              </div>
            </div>

            <div className="relative mt-5">
              <h3 className="text-sm font-semibold leading-5 transition-colors group-hover:text-primary sm:text-base">
                {category}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Explore services
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  </div>
</section>
        </div>
    );
};

export default CategorySection;
