"use client"

import { usePathname } from "next/navigation"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // key={pathname} forces a re-mount on every route change,
  // triggering the CSS animation fresh each time.
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  )
}
