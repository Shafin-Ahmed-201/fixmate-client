/**
 * Image helpers: optional ImgBB hosting + an offline fallback that
 * downscales images to a compact data URL (safe to store in MongoDB).
 */

const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY
const MAX_DIMENSION = 800
const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8 MB

export class ImageError extends Error {}

/** Compresses an image file to a ≤800px JPEG data URL. */
export function downscaleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () =>
      reject(new ImageError("Could not read the selected file"))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new ImageError("Unsupported image file"))
      img.onload = () => {
        const scale = Math.min(
          1,
          MAX_DIMENSION / Math.max(img.width, img.height)
        )
        const width = Math.max(1, Math.round(img.width * scale))
        const height = Math.max(1, Math.round(img.height * scale))

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new ImageError("Canvas is not supported"))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL("image/jpeg", 0.82))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

/** Uploads to ImgBB when a key is configured; otherwise stores a compressed data URL. */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/"))
    throw new ImageError("Please choose an image file")
  if (file.size > MAX_FILE_SIZE)
    throw new ImageError("Image must be smaller than 8 MB")

  if (IMGBB_KEY) {
    const form = new FormData()
    form.append("image", file)
    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
        {
          method: "POST",
          body: form,
        }
      )
      const data = (await res.json()) as {
        data?: { url?: string }
        error?: { message?: string }
      }
      if (res.ok && data.data?.url) return data.data.url
      throw new ImageError(data.error?.message || "ImgBB upload failed")
    } catch (err) {
      if (err instanceof ImageError) throw err
      // Network/key problems → fall back to the local data URL.
      return downscaleImage(file)
    }
  }

  return downscaleImage(file)
}
