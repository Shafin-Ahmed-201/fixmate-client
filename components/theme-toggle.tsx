"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "cn"

/**
 * Navbar light/dark switch. The icon is resolved purely through the `.dark`
 * class (never from React state) so server and client markup match and the
 * right icon is painted before hydration; labels stay static for the same
 * reason. Toggling is read from the DOM at click time, which is always
 * up to date.
 */
export function ThemeToggle({
  className,
  size = "icon-sm",
}: {
  className?: string
  size?: "icon-sm" | "icon" | "icon-lg"
}) {
  const { setTheme } = useTheme()

  function toggle() {
    const isDark = document.documentElement.classList.contains("dark")
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size={size}
      aria-label="Toggle color theme"
      title="Toggle light / dark mode"
      className={cn("shrink-0", className)}
      onClick={toggle}
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="block dark:hidden" />
    </Button>
  )
}
