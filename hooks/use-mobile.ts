import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

const subscribe = (callback: () => void) => {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

const getSnapshot = () => window.innerWidth < MOBILE_BREAKPOINT
const getServerSnapshot = () => false

export function useIsMobile() {
  // Subscribing to matchMedia instead of setState-in-effect keeps the hook
  // SSR-safe (server snapshot is false) without hydration warnings.
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
