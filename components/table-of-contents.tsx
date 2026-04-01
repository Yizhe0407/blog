"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { List } from "lucide-react"
import type { Heading } from "@/lib/posts"

const STICKY_OFFSET = 140 // must match scroll-mt-[140px] on headings

function useTocState(headings: Heading[]) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "")
  const suppressRef = useRef(false)

  useEffect(() => {
    if (headings.length === 0) return

    const onScroll = () => {
      if (suppressRef.current) return
      const threshold = window.scrollY + STICKY_OFFSET
      let current = headings[0]?.id ?? ""
      for (const { id } of headings) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= threshold) current = id
      }
      setActiveId(current)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [headings])

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return

    setActiveId(id)
    suppressRef.current = true
    clearTimeout((handleClick as unknown as { _timer?: number })._timer)
    ;(handleClick as unknown as { _timer?: number })._timer = window.setTimeout(
      () => { suppressRef.current = false },
      900,
    )

    const top = el.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
  }

  return { activeId, handleClick }
}

function TocLinks({
  headings,
  activeId,
  handleClick,
}: {
  headings: Heading[]
  activeId: string
  handleClick: (e: React.MouseEvent, id: string) => void
}) {
  return (
    <ul className="space-y-0.5">
      {headings.map(({ level, text, id }) => {
        const isActive = activeId === id
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              className={[
                "flex items-start gap-2 rounded-[6px] px-2.5 py-1.5 text-[12.5px] leading-[1.5] transition-all duration-150",
                level === 3 ? "ml-3.5" : "",
                isActive
                  ? "bg-[#efe7db] font-semibold text-[#3f3d39]"
                  : "text-[#6b665e] hover:bg-[#f0ebe3] hover:text-[#3f3d39]",
              ].join(" ")}
            >
              <span
                className={[
                  "mt-[0.48em] shrink-0 rounded-full transition-colors duration-150",
                  level === 2 ? "h-[5px] w-[5px]" : "h-[3.5px] w-[3.5px]",
                  isActive ? "bg-[#d8b892]" : "bg-[#c5bdb2]",
                ].join(" ")}
                aria-hidden="true"
              />
              {text}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/** Desktop sidebar panel (used inside aside.hidden.xl:block) */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const { activeId, handleClick } = useTocState(headings)

  if (headings.length === 0) return null

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#e2d8c8] bg-[#faf7f2]">
      <div className="px-5 pt-3.5 pb-1.5">
        <p
          className="text-lg font-semibold uppercase tracking-[0.12em] text-[#3f3d39]"
        >
          目錄
        </p>
      </div>
      <nav className="px-3.5 pt-1.5 pb-3">
        <TocLinks headings={headings} activeId={activeId} handleClick={handleClick} />
      </nav>
    </div>
  )
}

/**
 * Floating TOC for tablet / mobile.
 *
 * Two independent elements that share the same visual language:
 *   1. Trigger — a small square button, always at the right edge
 *   2. Panel   — the full TOC card, appears to the left of the trigger
 *
 * Neither element changes shape. They look like siblings, not one morphing shape.
 * The outer group covers both so hover stays active while moving between them.
 */
export function FloatingTableOfContents({ headings }: { headings: Heading[] }) {
  const { activeId, handleClick } = useTocState(headings)
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (headings.length === 0 || !isClient) return null

  return createPortal(
    <div className="group fixed right-0 top-1/2 z-50 -translate-y-1/2 flex items-center gap-2 xl:hidden">

      {/* Panel — invisible but occupies space, so group-hover stays active
          while the cursor travels from trigger toward the panel */}
      <div
        className={[
          "pointer-events-none opacity-0 translate-x-1",
          "group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-x-0",
          "transition-[opacity,transform] duration-200 ease-out",
          // Same card style as the desktop sidebar
          "overflow-hidden rounded-[16px] border border-[#e2d8c8] bg-[#faf7f2]",
        ].join(" ")}
        style={{ boxShadow: "0 4px 20px rgba(80, 58, 36, 0.09)" }}
      >
        <div className="px-5 pt-3.5 pb-1.5">
          <p
            className="text-lg font-semibold uppercase tracking-[0.12em] text-[#3f3d39]"
          >
            目錄
          </p>
        </div>
        <nav className="bg-[#faf7f2] px-3.5 pt-1.5 pb-3">
          <TocLinks headings={headings} activeId={activeId} handleClick={handleClick} />
        </nav>
      </div>

      {/* Trigger — never changes, just a small icon button */}
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
          "border border-[#e2d8c8] bg-[#faf7f2]",
          "transition-colors duration-150 group-hover:bg-[#efe7db] group-hover:border-[#d8c8b0]",
        ].join(" ")}
        style={{ boxShadow: "0 2px 8px rgba(80, 58, 36, 0.08)" }}
      >
        <List size={14} className="text-[#a09070] group-hover:text-[#6b5030] transition-colors duration-150" />
      </div>

    </div>,
    document.body,
  )
}
