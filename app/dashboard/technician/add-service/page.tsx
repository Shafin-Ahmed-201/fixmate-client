"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2Icon, PlusSquareIcon } from "lucide-react";
import { toast } from "sonner";

import { ImageUpload } from "@/components/image-upload";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants";
import type { Service, ServiceCategory, ServiceMode } from "@/lib/types";

/** Create a new service listing (starts in admin review). */
export default function AddServicePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ServiceCategory>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [serviceMode, setServiceMode] = useState<ServiceMode>(SERVICE_MODES[0]);
  const [serviceArea, setServiceArea] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (title.trim().length < 3) {
      return toast.error("Title must be at least 3 characters");
    }
    if (description.trim().length < 10) {
      return toast.error("Description must be at least 10 characters");
    }
    if (!(Number(priceInput) > 0)) {
      return toast.error("Enter a valid base price");
    }
    if (!estimatedDuration.trim()) {
      return toast.error("Estimated duration is required");
    }
    if (!category) {
      return toast.error("Choose a category");
    }
    if (!serviceMode) {
      return toast.error("Choose a service mode");
    }

    setSubmitting(true);
    try {
      await api<{ success: boolean; service: Service }>("/api/services", {
        method: "POST",
        body: {
          title: title.trim(),
          category,
          description: description.trim(),
          basePrice: Number(priceInput),
          estimatedDuration: estimatedDuration.trim(),
          serviceMode,
          serviceArea: serviceArea.trim(),
          image: image.trim(),
        },
      });
      toast.success("Service submitted for review");
      router.push("/dashboard/technician/my-services");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Please sign in again");
      } else {
        toast.error(err instanceof Error ? err.message : "Could not create the service");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add a service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          New services are reviewed by an admin before going live.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="gap-0 py-5">
          <CardHeader>
            <CardTitle className="text-base">Service details</CardTitle>
            <CardDescription>
              Describe what you offer, how it is delivered and what it costs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5">
            <div className="space-y-1.5">
              <Label htmlFor="service-title">Title *</Label>
              <Input
                id="service-title"
                placeholder="e.g. Screen replacement for iPhone 13"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-category">Category *</Label>
              <Select
                value={category}
                onValueChange={(next) =>
                  setCategory((next ?? CATEGORIES[0]) as ServiceCategory)
                }
                items={CATEGORIES.map((item) => ({ value: item, label: item }))}
              >
                <SelectTrigger id="service-category" className="w-full" aria-label="Category">
                  <SelectValue placeholder="Choose a category">
                    {(current: string) =>
                      CATEGORIES.find((item) => item === current) ?? "Choose a category"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-description">Description *</Label>
              <Textarea
                id="service-description"
                rows={4}
                placeholder="What does the service include? Which parts or tools are used?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="service-price">Base price *</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-muted-foreground">
                    USD
                  </span>
                  <Input
                    id="service-price"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    className="pl-10"
                    value={priceInput}
                    onChange={(event) => setPriceInput(event.target.value)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="service-duration">Estimated duration *</Label>
                <Input
                  id="service-duration"
                  placeholder="e.g. 45 min"
                  value={estimatedDuration}
                  onChange={(event) => setEstimatedDuration(event.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="service-mode">Service mode *</Label>
                <Select
                  value={serviceMode}
                  onValueChange={(next) =>
                    setServiceMode((next ?? SERVICE_MODES[0]) as ServiceMode)
                  }
                  items={SERVICE_MODES.map((item) => ({ value: item, label: item }))}
                >
                  <SelectTrigger id="service-mode" className="w-full" aria-label="Service mode">
                    <SelectValue placeholder="Choose a mode">
                      {(current: string) =>
                        SERVICE_MODES.find((item) => item === current) ?? "Choose a mode"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_MODES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="service-area">Service area</Label>
                <Input
                  id="service-area"
                  placeholder="e.g. Dhaka metro"
                  value={serviceArea}
                  onChange={(event) => setServiceArea(event.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Image</Label>
              <ImageUpload
                value={image}
                onChange={setImage}
                aspect="aspect-video"
                label="Upload service image"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2Icon className="animate-spin" /> : <PlusSquareIcon />}
            {submitting ? "Submitting…" : "Submit for review"}
          </Button>
        </div>
      </form>
    </div>
  );
}
