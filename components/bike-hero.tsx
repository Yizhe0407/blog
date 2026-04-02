"use client"

import { useEffect, useRef, useState } from "react"

const TOTAL_FRAMES = 120
const SCROLL_HEIGHT = "120vh"
const IMG_W = 1920
const IMG_H = 1080

function pickSrc(displayWidth: number): string {
  const small = displayWidth * (window.devicePixelRatio || 1) <= 900
  const size = small ? "828" : "1920"
  const base = `/frames/bike-hero-${size}`
  const supportsWebM =
    document.createElement("video").canPlayType('video/webm; codecs="vp9"') !== ""
  return supportsWebM ? `${base}.webm` : `${base}.mp4`
}

/** Binary spread: mid → [lo, mid-1] → [mid+1, hi] → …
 *  Ensures every scroll position has a nearby loaded frame fast. */
function spreadOrder(lo: number, hi: number): number[] {
  if (lo > hi) return []
  const mid = Math.floor((lo + hi) / 2)
  return [mid, ...spreadOrder(lo, mid - 1), ...spreadOrder(mid + 1, hi)]
}

export function BikeHero() {
  const sectionRef   = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const videoRef     = useRef<HTMLVideoElement>(null)
  const bitmaps      = useRef<(ImageBitmap | null)[]>(new Array(TOTAL_FRAMES + 1).fill(null))
  const currentFrame = useRef(TOTAL_FRAMES)
  const rafPending   = useRef(false)
  const [loaded, setLoaded] = useState(false)
  const [overlayPos, setOverlayPos] = useState<{ value: number } | null>(null)

  // ─── draw a specific frame ─────────────────────────────────────────────────
  function draw(frame: number) {
    const canvas = canvasRef.current
    const bm = bitmaps.current[frame]
    if (!canvas || !bm) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const srcW = bm.width
    const srcH = bm.height
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const scale = Math.min(canvas.width / srcW, canvas.height / srcH)
    ctx.drawImage(
      bm,
      (canvas.width  - srcW * scale) / 2,
      (canvas.height - srcH * scale) / 2,
      srcW * scale,
      srcH * scale,
    )
  }

  // ─── canvas resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1

    function resize() {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      canvas.width  = rect.width  * dpr
      canvas.height = rect.height * dpr
      draw(currentFrame.current)

      const isPortrait = rect.width / rect.height < IMG_W / IMG_H
      if (isPortrait) {
        const imgH   = IMG_H * (rect.width / IMG_W)
        const margin = (rect.height - imgH) / 2
        setOverlayPos({ value: margin })
      } else {
        setOverlayPos(null)
      }
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()
    return () => ro.disconnect()
  }, [])

  // ─── extract all frames from video as ImageBitmaps ────────────────────────
  useEffect(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const rect = canvas.getBoundingClientRect()
    video.src = pickSrc(rect.width)

    function seekAndCapture(frameIndex: number): Promise<void> {
      return new Promise((resolve) => {
        const t = ((frameIndex - 1) / (TOTAL_FRAMES - 1)) * video!.duration
        video!.currentTime = t
        video!.addEventListener(
          "seeked",
          async () => {
            try {
              bitmaps.current[frameIndex] = await createImageBitmap(video!)
            } catch {
              /* ignore */
            }
            resolve()
          },
          { once: true },
        )
      })
    }

    video.addEventListener("loadedmetadata", async () => {
      // Phase 1: extract last frame first (initial visible state)
      await seekAndCapture(TOTAL_FRAMES)
      setLoaded(true)
      draw(TOTAL_FRAMES)

      // Phase 2: extract rest in spread order
      const order = spreadOrder(1, TOTAL_FRAMES - 1)
      for (const frame of order) {
        await seekAndCapture(frame)
        // if this frame is near what the user is looking at, refresh
        if (Math.abs(frame - currentFrame.current) <= 2) {
          draw(currentFrame.current)
        }
      }
    })
  }, [])

  // ─── scroll → frame ────────────────────────────────────────────────────────
  useEffect(() => {
    function onScroll() {
      if (rafPending.current) return
      rafPending.current = true

      requestAnimationFrame(() => {
        rafPending.current = false
        const section = sectionRef.current
        if (!section) return
        const scrolled   = -section.getBoundingClientRect().top
        const scrollable = section.offsetHeight - window.innerHeight
        const progress   = Math.max(0, Math.min(1, scrolled / scrollable))
        const target     = Math.round(TOTAL_FRAMES - progress * (TOTAL_FRAMES - 1))
        if (target === currentFrame.current) return
        currentFrame.current = target

        // Find nearest loaded frame as fallback
        let frame = target
        if (!bitmaps.current[frame]) {
          let lo = frame - 1, hi = frame + 1
          while (lo >= 1 || hi <= TOTAL_FRAMES) {
            if (lo >= 1            && bitmaps.current[lo]) { frame = lo; break }
            if (hi <= TOTAL_FRAMES && bitmaps.current[hi]) { frame = hi; break }
            lo--; hi++
          }
        }
        draw(frame)
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section
      ref={sectionRef}
      style={{ height: SCROLL_HEIGHT }}
      className="relative -mt-[84px] sm:-mt-[122px]"
    >
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="hidden"
        aria-hidden="true"
      />

      <div className="sticky top-0 h-[100dvh] flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.4s" }}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Text — top right */}
        <div
          className="absolute top-[100px] sm:top-[140px] right-8 sm:right-24 max-w-[180px] sm:max-w-[240px] flex flex-col gap-2 text-right pointer-events-none"
          style={overlayPos ? { top: overlayPos.value + 16, bottom: "auto" } : undefined}
        >
          <p
            className="text-[18px] sm:text-[24px] font-extrabold leading-tight text-[#3f3d39]"
            style={{ fontFamily: "var(--font-comic-relief)" }}
          >
            Ideas, assembled.
          </p>
          <p
            className="text-[12px] sm:text-[14px] font-normal leading-relaxed text-[#6b665e]"
            style={{ fontFamily: "var(--font-comic-relief)" }}
          >
            A blog where scattered thoughts come together — just like a bike.
          </p>
        </div>

        {/* Text — bottom left */}
        <div
          className="absolute bottom-12 sm:bottom-16 left-8 sm:left-24 max-w-[160px] sm:max-w-[220px] flex flex-col gap-1 pointer-events-none"
          style={overlayPos ? { bottom: overlayPos.value + 16, top: "auto" } : undefined}
        >
          <p
            className="text-[18px] sm:text-[22px] font-extrabold leading-tight text-[#3f3d39]"
            style={{ fontFamily: "var(--font-comic-relief)" }}
          >
            Ride.
            <br />
            Read.
            <br />
            Reflect.
          </p>
          <p
            className="text-[12px] sm:text-[13px] font-normal leading-relaxed text-[#6b665e]"
            style={{ fontFamily: "var(--font-comic-relief)" }}
          >
            Notes from someone who thinks on two wheels.
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-1/2 translate-x-1/2 pointer-events-none">
          <svg className="animate-bounce" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 3v14M4 11l6 6 6-6"
              stroke="#c5bdb2"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
