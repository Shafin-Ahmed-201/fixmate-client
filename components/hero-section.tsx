
"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ShieldCheckIcon,
  WrenchIcon,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const heroImages = [
  "/images/fixmate-hero-1.jpg",
  "/images/fixmate-hero-2.jpg",
  "/images/fixmate-hero-3.jpg",
  "/images/fixmate-hero-4.jpg",
]

export default function HeroSection() {
  const [activeImage, setActiveImage] = useState(0)

  // Automatically change background every 5 seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((current) => (current + 1) % heroImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative isolate flex min-h-[650px] items-center overflow-hidden bg-[#102A56] sm:min-h-[700px]">

      {/* Background image slider */}
      {heroImages.map((image, index) => (
        <div
          key={image}
          aria-hidden="true"
          className={`absolute inset-0 -z-20 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            activeImage === index ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `url("${image}")`,
          }}
        />
      ))}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#071A35]/95 via-[#102A56]/80 to-[#102A56]/40" />

      {/* Additional bottom gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#071A35]/60 via-transparent to-[#071A35]/20" />

      {/* Hero content */}
      <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="max-w-3xl">

          {/* Badge */}
          <Badge className="mb-6 gap-2 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-400/10">
            <ShieldCheckIcon className="h-4 w-4" />
            Verified local technicians
          </Badge>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white text-balance sm:text-5xl lg:text-7xl">
            Repairs done right,
            <span className="mt-2 block bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              booked in minutes.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            FixMate connects you with trusted technicians for smartphones,
            laptops, ACs, refrigerators, TVs, washing machines and electrical
            work. Enjoy transparent pricing, secure payments and reliable
            repair services.
          </p>

          {/* CTA buttons */}
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">

            <Button
              nativeButton={false}
              render={<Link href="/services" />}
              size="lg"
              className="h-13 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-7 text-base font-semibold text-white shadow-lg shadow-blue-950/30 transition-all hover:-translate-y-1 hover:from-blue-700 hover:to-cyan-600"
            >
              <WrenchIcon className="mr-2 h-5 w-5" />
              Browse services
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              nativeButton={false}
              render={<Link href="/sign-up" />}
              size="lg"
              variant="outline"
              className="h-13 rounded-xl border-white/50 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white hover:text-[#102A56]"
            >
              Become a technician
            </Button>
          </div>

          {/* Statistics */}
          <div className="mt-14 grid max-w-xl grid-cols-3 gap-4 border-t border-white/20 pt-8">

            {[
              { value: "7+", label: "Repair categories" },
              { value: "100%", label: "Secure payments" },
              { value: "24/7", label: "Online booking" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-2xl font-extrabold text-white sm:text-3xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs text-slate-300 sm:text-sm">
                  {stat.label}
                </dd>
              </div>
            ))}

          </div>
        </div>

        {/* Slider indicators */}
        <div className="mt-10 flex items-center gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show background image ${index + 1}`}
              aria-current={activeImage === index}
              onClick={() => setActiveImage(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeImage === index
                  ? "w-10 bg-cyan-400"
                  : "w-5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-white/70">
            {String(activeImage + 1).padStart(2, "0")} / 04
          </span>
        </div>
      </div>
    </section>
  )
}
