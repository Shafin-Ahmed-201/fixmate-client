"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Toaster as SonnerToaster } from "sonner"

/**
 * Sonner toasts that follow the active theme. Mounting is tracked so the
 * first client render matches the server-rendered markup exactly.
 */
export function Toaster() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      theme={mounted && resolvedTheme === "dark" ? "dark" : "light"}
    />
  )
}
