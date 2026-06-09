"use client"

import { useEffect, useRef, useState } from "react"

const MIN_VISIBLE_MS = 1200

export function PageLoader() {
  const [fadeOut, setFadeOut] = useState(false)
  const [gone, setGone] = useState(false)
  const showTimeRef = useRef(0)
  const dismissedRef = useRef(false)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const goneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    showTimeRef.current = Date.now()

    const dismiss = () => {
      if (dismissedRef.current) return
      dismissedRef.current = true
      const elapsed = Date.now() - showTimeRef.current
      const delay = Math.max(0, MIN_VISIBLE_MS - elapsed)
      dismissTimerRef.current = setTimeout(() => {
        setFadeOut(true)
        goneTimerRef.current = setTimeout(() => setGone(true), 700)
      }, delay)
    }

    // Guard: event may have fired before this effect registered (e.g. cached GLB)
    if ((window as Window & { __bike3dLoaded?: boolean }).__bike3dLoaded) {
      dismiss()
    }

    const onLoaded = () => dismiss()
    const fallback = setTimeout(dismiss, 15000)

    window.addEventListener("bike3d:loaded", onLoaded)

    return () => {
      clearTimeout(fallback)
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current)
      if (goneTimerRef.current) clearTimeout(goneTimerRef.current)
      window.removeEventListener("bike3d:loaded", onLoaded)
    }
  }, [])

  if (gone) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f7f4ee]"
      style={{
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 0.7s ease-out",
        pointerEvents: fadeOut ? "none" : "auto",
      }}
      aria-hidden="true"
    >
      <video
        src="/lodding.webm"
        className="h-56 w-56 object-contain"
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  )
}
