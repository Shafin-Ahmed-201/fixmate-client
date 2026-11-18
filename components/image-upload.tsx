"use client"

import { ImageIcon, Loader2Icon, XIcon } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { uploadImage } from "@/lib/image"
import { cn } from "cn"

/**
 * Image picker used for avatars and service photos.
 * Uploads through ImgBB when NEXT_PUBLIC_IMGBB_API_KEY is set,
 * otherwise stores a compressed data URL locally.
 */
export function ImageUpload({
  value,
  onChange,
  className,
  label = "Upload image",
  aspect = "aspect-video",
}: {
  value: string
  onChange: (url: string) => void
  className?: string
  label?: string
  aspect?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
      toast.success("Image uploaded")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "border-input bg-muted/40 text-muted-foreground relative flex w-full items-center justify-center overflow-hidden rounded-lg border border-dashed",
          aspect
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-xs">
            <ImageIcon className="size-6" />
            <span>No image selected</span>
          </div>
        )}

        {uploading && (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
            <Loader2Icon className="size-5 animate-spin" />
          </div>
        )}

        {value && !uploading && (
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={() => onChange("")}
            aria-label="Remove image"
          >
            <XIcon />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : label}
        </Button>
        <span className="text-muted-foreground text-xs">
          JPG/PNG up to 8 MB
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
    </div>
  )
}
