"use client"

import { usePathname } from "next/navigation"
import { PageLoader } from "./page-loader"

export function HomepageLoader() {
  const pathname = usePathname()
  if (pathname !== "/") return null
  return <PageLoader />
}
