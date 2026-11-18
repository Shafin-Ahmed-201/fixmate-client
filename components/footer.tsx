import Link from "next/link";
import { Logo } from "@/components/logo";
import { CATEGORIES } from "@/lib/constants";
import { GlobeIcon, MailIcon, MapPinIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";

const COMPANY_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/services", label: "Browse services" },
  { href: "/sign-up", label: "Become a technician" },
];

const SUPPORT_LINKS = [
  { href: "/sign-in", label: "Sign in" },
  { href: "/sign-up", label: "Create account" },
  { href: "/dashboard/profile", label: "My profile" },
];

/** Public site footer — consistent across every marketing page. */
export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Book trusted local technicians for smartphone, appliance, AC and electrical
            repairs — fast, transparent and affordable.
          </p>
          <div className="flex items-center gap-2">
            {[
              { icon: GlobeIcon, label: "Website" },
              { icon: MessageCircleIcon, label: "Community" },
              { icon: MailIcon, label: "Email" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                aria-label={label}
                className="flex size-8 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Categories</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {CATEGORIES.slice(0, 5).map((category) => (
              <li key={category}>
                <Link
                  href={`/services?category=${encodeURIComponent(category)}`}
                  className="transition-colors hover:text-foreground"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Support</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {SUPPORT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <PhoneIcon className="size-4" /> +880 1700-000000
            </li>
            <li className="flex items-center gap-2">
              <MailIcon className="size-4" /> support@fixmate.com
            </li>
            <li className="flex items-center gap-2">
              <MapPinIcon className="size-4" /> Dhaka, Bangladesh
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} FixMate. All rights reserved.</p>
          <p>Repair bookings made simple.</p>
        </div>
      </div>
    </footer>
  );
}
