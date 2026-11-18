"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PencilIcon, PlusSquareIcon, Trash2Icon, WrenchIcon } from "lucide-react";
import { toast } from "sonner";

import { ApprovalBadge } from "@/components/badges";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ImageUpload } from "@/components/image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError } from "@/lib/api";
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import type { Service, ServiceCategory, ServiceMode } from "@/lib/types";

/** Technician's own services: availability, editing and deletion. */
export default function MyServicesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api<{ services: Service[] }>("/api/services/my")
      .then((res) => setServices(res.services))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Failed to load your services")
      );
  }, []);

  useEffect(load, [load]);

  async function toggleAvailability(service: Service, next: boolean) {
    try {
      const res = await api<{ service: Service }>(`/api/services/${service._id}`, {
        method: "PATCH",
        body: { isAvailable: next },
      });
      toast.success("Availability updated");
      setServices((prev) =>
        prev === null
          ? prev
          : prev.map((item) => (item._id === res.service._id ? res.service : item))
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update availability"
      );
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/api/services/${deleteTarget._id}`, { method: "DELETE" });
      toast.success("Service deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the service");
    } finally {
      setDeleting(false);
    }
  }

  if (error) {
    return (
      <p className="py-16 text-center text-sm text-destructive" role="alert">
        {error}
      </p>
    );
  }

  if (services === null) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-lg border p-4">
              <Skeleton className="aspect-video w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {services.length} service{services.length === 1 ? "" : "s"} in your
            catalogue
          </p>
        </div>
        <Button render={<Link href="/dashboard/technician/add-service" />} size="sm">
          <PlusSquareIcon /> Add service
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={WrenchIcon}
          title="No services yet"
          description="Create your first service listing to start receiving booking requests."
        >
          <Button
            render={<Link href="/dashboard/technician/add-service" />}
            className="mt-4"
          >
            Create your first service
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service._id} className="h-full gap-0 py-0">
              <div className="aspect-video overflow-hidden bg-muted">
                {service.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <WrenchIcon className="size-8" />
                  </div>
                )}
              </div>

              <CardContent className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="truncate font-medium">{service.title}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="border-transparent">
                    {service.category}
                  </Badge>
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(service.basePrice)}
                </p>
                <ApprovalBadge status={service.approvalStatus} />
                <p className="text-xs text-muted-foreground">
                  {service.serviceMode} · {service.estimatedDuration}
                </p>
              </CardContent>

              <CardFooter className="gap-2 p-3">
                <div className="flex flex-1 items-center gap-2">
                  <Switch
                    checked={service.isAvailable}
                    onCheckedChange={(next) => void toggleAvailability(service, next)}
                    aria-label="Availability"
                  />
                  <span className="text-xs text-muted-foreground">
                    {service.isAvailable ? "Available" : "Paused"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setEditing(service)}
                >
                  <PencilIcon /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  className="text-destructive"
                  onClick={() => setDeleteTarget(service)}
                >
                  <Trash2Icon /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Edit service */}
      <Dialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit service</DialogTitle>
            <DialogDescription>
              Editing content sends the service back to admin review.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <EditServiceForm
              key={editing._id}
              service={editing}
              onClose={() => setEditing(null)}
              onSaved={() => {
                setEditing(null);
                load();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this service?"
        description="This permanently removes it from the catalogue."
        confirmLabel="Yes, delete service"
        cancelLabel="Keep service"
        onConfirm={handleDelete}
        disabled={deleting}
      />
    </div>
  );
}

function EditServiceForm({
  service,
  onClose,
  onSaved,
}: {
  service: Service;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(service.title);
  const [category, setCategory] = useState<ServiceCategory>(service.category);
  const [description, setDescription] = useState(service.description);
  const [priceInput, setPriceInput] = useState(String(service.basePrice));
  const [estimatedDuration, setEstimatedDuration] = useState(service.estimatedDuration);
  const [serviceMode, setServiceMode] = useState<ServiceMode>(service.serviceMode);
  const [serviceArea, setServiceArea] = useState(service.serviceArea);
  const [image, setImage] = useState(service.image);
  const [saving, setSaving] = useState(false);

  async function handleSave(event: React.FormEvent) {
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

    setSaving(true);
    try {
      await api<{ success: boolean; service: Service }>(`/api/services/${service._id}`, {
        method: "PATCH",
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
      toast.success("Service updated — pending admin review");
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Please sign in again");
      } else {
        toast.error(err instanceof Error ? err.message : "Could not update the service");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edit-title">Title *</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={saving}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-category">Category *</Label>
        <Select
          value={category}
          onValueChange={(next) => setCategory((next ?? CATEGORIES[0]) as ServiceCategory)}
          items={CATEGORIES.map((item) => ({ value: item, label: item }))}
        >
          <SelectTrigger id="edit-category" className="w-full" aria-label="Category">
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
        <Label htmlFor="edit-description">Description *</Label>
        <Textarea
          id="edit-description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={saving}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-price">Base price *</Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-muted-foreground">
              USD
            </span>
            <Input
              id="edit-price"
              type="number"
              min={0}
              step={0.01}
              className="pl-10"
              value={priceInput}
              onChange={(event) => setPriceInput(event.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-duration">Estimated duration *</Label>
          <Input
            id="edit-duration"
            value={estimatedDuration}
            onChange={(event) => setEstimatedDuration(event.target.value)}
            disabled={saving}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="edit-mode">Service mode *</Label>
          <Select
            value={serviceMode}
            onValueChange={(next) =>
              setServiceMode((next ?? SERVICE_MODES[0]) as ServiceMode)
            }
            items={SERVICE_MODES.map((item) => ({ value: item, label: item }))}
          >
            <SelectTrigger id="edit-mode" className="w-full" aria-label="Service mode">
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
          <Label htmlFor="edit-area">Service area</Label>
          <Input
            id="edit-area"
            value={serviceArea}
            onChange={(event) => setServiceArea(event.target.value)}
            disabled={saving}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Image</Label>
        <ImageUpload value={image} onChange={setImage} aspect="aspect-video" label="Upload service image" />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
