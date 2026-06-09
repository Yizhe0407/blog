"use client"

import dynamic from "next/dynamic"
import type { ComponentProps } from "react"
import type { BikeHero3D as BikeHero3DType } from "./bike-hero-3d"

const BikeHero3DDynamic = dynamic(
  () => import("@/components/bike-hero-3d").then(m => m.BikeHero3D),
  { ssr: false },
)

export function BikeHero3D(props: ComponentProps<typeof BikeHero3DType>) {
  return <BikeHero3DDynamic {...props} />
}
