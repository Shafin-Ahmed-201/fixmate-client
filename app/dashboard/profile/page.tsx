"use client"

import { useState } from "react"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { toast } from "sonner"

import { ImageUpload } from "@/components/image-upload"
import { RoleBadge } from "@/components/badges"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api, ApiError } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import { initials } from "@/lib/format"
import type { Role, User } from "@/lib/types"

/** Editable profile: name, phone, area, bio and avatar. */
export default function ProfilePage() {
  const { data: session, isPending, refetch } = authClient.useSession()

  if (isPending || !session?.user) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-8 w-48 animate-pulse rounded-md" />
        <div className="bg-muted h-80 animate-pulse rounded-lg" />
      </div>
    )
  }

  return <ProfileForm user={session.user} refetch={refetch} />
}

function ProfileForm({
  user,
  refetch,
}: {
  user: {
    name: string
    email: string
    image?: string | null
    role: string
    phone?: string | null
    area?: string | null
    bio?: string | null
  }
  refetch: () => Promise<unknown>
}) {
  const [name, setName] = useState(user.name ?? "")
  const [phone, setPhone] = useState(user.phone ?? "")
  const [area, setArea] = useState(user.area ?? "")
  const [bio, setBio] = useState(user.bio ?? "")
  const [image, setImage] = useState(user.image ?? "")
  const [saving, setSaving] = useState(false)

  const role = user.role as Role

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) return toast.error("Name cannot be empty")

    setSaving(true)
    try {
      await api<{ success: boolean; user: User }>("/api/users/profile", {
        method: "PATCH",
        body: {
          name: name.trim(),
          phone: phone.trim(),
          area: area.trim(),
          bio: bio.trim(),
          image: image.trim(),
        },
      })
      await refetch()
      toast.success("Profile updated")
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error("Your session expired — please sign in again")
      } else {
        toast.error(err instanceof Error ? err.message : "Update failed")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          How you appear to technicians, customers and admins.
        </p>
      </div>

      {/* Identity summary */}
      <Card className="gap-0 py-5">
        <CardContent className="flex items-center gap-4 px-5">
          <Avatar className="size-16">
            <AvatarImage src={image || undefined} alt={name} />
            <AvatarFallback className="text-lg">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium">{name}</p>
              <RoleBadge role={role} />
            </div>
            <p className="text-muted-foreground truncate text-sm">
              {user.email}
            </p>
            <p className="text-muted-foreground text-xs">
              Role: <span className="capitalize">{role}</span> · email changes
              are not possible here
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave}>
        <Card className="gap-0 py-5">
          <CardHeader>
            <CardTitle className="text-base">Personal details</CardTitle>
            <CardDescription>
              A phone number is required before you can request a booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full name *</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-area">Area / city</Label>
                <Input
                  id="profile-area"
                  placeholder="e.g. Dhanmondi, Dhaka"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-bio">Bio</Label>
              <Textarea
                id="profile-bio"
                rows={4}
                placeholder="A short line about you…"
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Avatar</Label>
              <ImageUpload
                value={image}
                onChange={setImage}
                aspect="aspect-square"
                className="max-w-44"
                label="Upload avatar"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
