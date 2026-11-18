"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  Loader2Icon,
  MapPinIcon,
  ShieldCheckIcon,
  UserIcon,
  WrenchIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Service } from "@/lib/types";
import { cn } from "cn";

const MIN_DESCRIPTION_LENGTH = 20;

/** Tomorrow as a yyyy-mm-dd string (HTML date input min). */
function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
}

export function ServiceDetail({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [service, setService] = useState<Service | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState(tomorrow());
  const [description, setDescription] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<{ success: boolean; service: Service }>(`/api/services/${serviceId}`, {
      auth: false,
    })
      .then((res) => {
        if (!cancelled) setService(res.service);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(
            err instanceof ApiError && err.status === 404
              ? "This service does not exist or is no longer available."
              : err instanceof Error
                ? err.message
                : "Failed to load the service."
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  function handleBook() {
    if (!session?.user) {
      router.push(`/sign-in?redirect=${encodeURIComponent(`/services/${serviceId}`)}`);
      return;
    }
    setBookingOpen(true);
  }

  async function handleBookingSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!service) return;

    if (!address.trim()) return toast.error("Please enter the service address");
    if (!preferredDate || preferredDate < tomorrow())
      return toast.error("Please pick a future date");
    if (description.trim().length < MIN_DESCRIPTION_LENGTH)
      return toast.error(`Describe the problem in at least ${MIN_DESCRIPTION_LENGTH} characters`);

    setSubmitting(true);
    try {
      await api("/api/bookings", {
        method: "POST",
        body: {
          serviceId: service._id,
          address: address.trim(),
          phone: phone.trim() || undefined,
          preferredDate: new Date(`${preferredDate}T09:00:00`).toISOString(),
          problemDescription: description.trim(),
        },
      });
      toast.success("Booking request sent!");
      setBookingOpen(false);
      router.push("/dashboard/customer/bookings");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Please sign in to book this service");
        router.push(`/sign-in?redirect=${encodeURIComponent(`/services/${serviceId}`)}`);
      } else {
        toast.error(err instanceof Error ? err.message : "Booking failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <WrenchIcon className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">Service unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
        <Button render={<Link href="/services" />} variant="outline" className="mt-6">
          <ArrowLeftIcon /> Back to services
        </Button>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Skeleton className="h-4 w-40" />
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const descriptionLength = description.trim().length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Button render={<Link href="/services" />} variant="ghost" size="sm" className="mb-4">
        <ArrowLeftIcon /> All services
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            {service.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={service.image}
                alt={service.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <WrenchIcon className="size-10" />
              </div>
            )}
            <Badge variant="secondary" className="absolute top-3 left-3 border-transparent">
              {service.category}
            </Badge>
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {service.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <UserIcon className="size-4" /> {service.technicianName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon className="size-4" /> {service.estimatedDuration}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPinIcon className="size-4" /> {service.serviceMode}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="size-4" /> Added {formatDate(service.createdAt)}
              </span>
            </div>
          </div>

          <div className="rounded-lg border p-5">
            <h2 className="font-medium">About this service</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {service.description}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: MapPinIcon, label: "Service area", value: service.serviceArea },
              { icon: ClockIcon, label: "Duration", value: service.estimatedDuration },
              { icon: ShieldCheckIcon, label: "Mode", value: service.serviceMode },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border p-4">
                <item.icon className="size-4 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Booking card */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Base price</p>
            <p className="text-3xl font-semibold tracking-tight">
              {formatCurrency(service.basePrice)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Final price is confirmed by the technician before work starts.
            </p>

            <ul className="mt-4 space-y-2 border-t pt-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheckIcon className="size-4 text-emerald-500" /> Verified technician
              </li>
              <li className="flex items-center gap-2">
                <CalendarIcon className="size-4 text-emerald-500" /> Flexible appointment
              </li>
              <li className="flex items-center gap-2">
                <WrenchIcon className="size-4 text-emerald-500" /> {service.serviceMode}
              </li>
            </ul>

            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={!service.isAvailable || isPending}
              onClick={handleBook}
            >
              {service.isAvailable ? "Book this service" : "Currently unavailable"}
            </Button>
            {!service.isAvailable && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                The technician has paused this service.
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Booking modal */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Book “{service.title}”</DialogTitle>
            <DialogDescription>
              Tell the technician where and when you need the repair.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="booking-address">Service address *</Label>
              <Input
                id="booking-address"
                placeholder="House, road, area, city"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="booking-phone">Phone (optional)</Label>
                <Input
                  id="booking-phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="booking-date">Preferred date *</Label>
                <Input
                  id="booking-date"
                  type="date"
                  min={tomorrow()}
                  value={preferredDate}
                  onChange={(event) => setPreferredDate(event.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="booking-description">Problem description *</Label>
                <span
                  className={cn(
                    "text-xs",
                    descriptionLength < MIN_DESCRIPTION_LENGTH
                      ? "text-muted-foreground"
                      : "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {descriptionLength}/{MIN_DESCRIPTION_LENGTH}
                </span>
              </div>
              <Textarea
                id="booking-description"
                rows={4}
                placeholder="Describe the issue, model/brand and any error codes…"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={submitting}
                aria-invalid={descriptionLength > 0 && descriptionLength < MIN_DESCRIPTION_LENGTH}
              />
              <p className="text-xs text-muted-foreground">
                Minimum {MIN_DESCRIPTION_LENGTH} characters so the technician can prepare.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBookingOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2Icon className="animate-spin" />}
                {submitting ? "Sending…" : "Send booking request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
