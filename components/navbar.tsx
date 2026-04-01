"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"

const navLinks = [
  { label: "Notes",     href: "/notes",              external: false },
  { label: "Topics",   href: "/topics",             external: false },
  { label: "Portfolio", href: "https://yizhe.dev/", external: true  },
]

export function Navbar() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const rafId = useRef<number>(0)

  // Active index among the 3 nav links (-1 = none, e.g. on home page)
  const activeNavIndex = navLinks.findIndex(
    ({ href, external }) =>
      !external && (pathname === href || pathname.startsWith(href + "/")),
  )
  const isHome = pathname === "/"

  // Reset scroll baseline on route change so the hide-on-scroll logic restarts correctly
  useEffect(() => {
    lastScrollY.current = window.scrollY
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafId.current)
      rafId.current = requestAnimationFrame(() => {
        const currentY = window.scrollY
        const delta = currentY - lastScrollY.current
        if (Math.abs(delta) >= 5) {
          setVisible(delta < 0 || currentY < 80)
          lastScrollY.current = currentY
        }
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8 px-3 sm:px-6"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "transform",
      }}
    >
      <nav className="flex items-center gap-1 rounded-[22px] border border-[#e7e1d7] bg-[rgba(251,249,244,0.95)] backdrop-blur-sm px-4 sm:px-6 py-4 h-[72px] w-full max-w-[380px]">

        {/* Home icon with its own underline */}
        <Link
          href="/"
          className="relative flex items-center justify-center w-11 h-11 shrink-0 mr-3"
          aria-label="Home"
        >
          <Home size={20} className="text-[#3f3d39]" />
          <span
            className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[#18181b]"
            style={{
              opacity: isHome ? 1 : 0,
              transition: "opacity 0.25s ease",
            }}
          />
        </Link>

        {/* Nav links with a single shared sliding underline */}
        <div className="flex flex-1 relative">
          {navLinks.map(({ label, href, external }) => (
            <Link
              key={href}
              href={href}
              {...(external && { target: "_blank", rel: "noopener noreferrer" })}
              className="flex-1 flex items-center justify-center px-3 py-2 font-[family-name:var(--font-open-huninn)] text-[13.5px] font-semibold text-[#52525c] hover:text-[#3f3d39] transition-colors"
            >
              {label}
            </Link>
          ))}

          {/*
            Single underline element that slides between links.
            Width = 1/3 of container - 24px (px-3 on each side).
            translateX per step: element's own 100% + 24px (adds back the padding).
            GPU-composited: only transform + opacity change.
          */}
          <span
            className="absolute bottom-[-4px] h-0.5 rounded-full bg-[#18181b] pointer-events-none"
            style={{
              left: "12px",
              width: "calc(33.333% - 24px)",
              transform: `translateX(calc(${activeNavIndex * 100}% + ${activeNavIndex * 24}px))`,
              opacity: activeNavIndex >= 0 ? 1 : 0,
              transition:
                "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease",
              willChange: "transform",
            }}
          />
        </div>
      </nav>
    </header>
  )
}
