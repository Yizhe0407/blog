"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js"

// ─── types ────────────────────────────────────────────────────────────────────

type Tier = "full" | "lite" | "static"

interface Props {
  scrollHeight?: string
  className?: string
  children?: React.ReactNode
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function detectTier(): Tier {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "static"
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4
  const cores = navigator.hardwareConcurrency ?? 4
  const mobile = window.matchMedia("(max-width: 768px)").matches
  if (mem <= 2 || cores <= 2) return mobile ? "static" : "lite"
  if (mobile) return "lite"
  return "full"
}

function disposeObject(obj: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()

  obj.traverse(child => {
    const renderable = child as THREE.Object3D & {
      geometry?: THREE.BufferGeometry
      material?: THREE.Material | THREE.Material[]
    }

    if (renderable.geometry) geometries.add(renderable.geometry)
    if (renderable.material) {
      const mats = Array.isArray(renderable.material) ? renderable.material : [renderable.material]
      mats.forEach(material => materials.add(material))
    }
  })

  geometries.forEach(geometry => geometry.dispose())
  materials.forEach(material => material.dispose())
}

function signalLoaded() {
  ;(window as Window & { __bike3dLoaded?: boolean }).__bike3dLoaded = true
  window.dispatchEvent(new CustomEvent("bike3d:loaded"))
}

function emitLoadProgress(progress: number) {
  window.dispatchEvent(new CustomEvent("bike3d:progress", { detail: progress }))
}

async function loadGltfWithProgress(url: string, signal: AbortSignal): Promise<GLTF> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`)
  }

  const totalBytes = Number(response.headers.get("content-length") ?? 0)

  if (!response.body) {
    emitLoadProgress(0)
    const buffer = await response.arrayBuffer()
    emitLoadProgress(99)
    return new Promise((resolve, reject) => {
      new GLTFLoader().parse(buffer, "", resolve, reject)
    })
  }

  const reader = response.body.getReader()
  let loadedBytes = 0
  const chunks: Uint8Array[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue

    chunks.push(value)
    loadedBytes += value.byteLength
    if (totalBytes > 0) {
      emitLoadProgress(Math.min(99, Math.round((loadedBytes / totalBytes) * 99)))
    }
  }

  if (!totalBytes) emitLoadProgress(99)

  const buffer = new Uint8Array(loadedBytes)
  let offset = 0
  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.byteLength
  }

  return new Promise((resolve, reject) => {
    new GLTFLoader().parse(buffer.buffer, "", resolve, reject)
  })
}

// ─── component ────────────────────────────────────────────────────────────────

export function BikeHero3D({ scrollHeight = "300vh", className, children }: Props) {
  const sectionRef    = useRef<HTMLDivElement>(null)
  const mountRef      = useRef<HTMLDivElement>(null)   // renderer canvas parent

  const rendererRef   = useRef<THREE.WebGLRenderer | null>(null)
  const mixerRef      = useRef<THREE.AnimationMixer | null>(null)
  const sceneRef      = useRef<THREE.Scene | null>(null)
  const cameraRef     = useRef<THREE.PerspectiveCamera | null>(null)
  const durationRef   = useRef(4)
  const scrubEndRef   = useRef(3) // duration * 0.75: most-exploded point in cyclic animation

  const progressRef   = useRef(0)
  const rafIdRef      = useRef(0)

  // ssr: false guarantees window exists on first render — safe to call directly
  const [tier  ] = useState<Tier>(() => detectTier())
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  // ── 2. init renderer + load model ──────────────────────────────────────────
  useEffect(() => {
    if (!tier) return
    if (tier === "static") {
      signalLoaded()
      return () => {
        delete (window as Window & { __bike3dLoaded?: boolean }).__bike3dLoaded
      }
    }
    const mount = mountRef.current
    if (!mount) return

    let cancelled = false

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(tier === "full" ? (window.devicePixelRatio || 1) : 1)
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.domElement.style.pointerEvents = "none"
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // flat ambient-only lighting — technical drawing style has no dramatic shadows
    scene.add(new THREE.AmbientLight(0xffffff, 3.0))
    const softKey = new THREE.DirectionalLight(0xfff8f0, 1.5)
    softKey.position.set(4, 8, 4)
    scene.add(softKey)

    // camera (repositioned after model load via bounding box)
    const camera = new THREE.PerspectiveCamera(28, mount.clientWidth / mount.clientHeight, 0.01, 1000)
    cameraRef.current = camera

    // resize observer
    const ro = new ResizeObserver(() => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    })
    ro.observe(mount)

    const abortController = new AbortController()
    let cleaned = false

    const cleanup = () => {
      if (cleaned) return
      cleaned = true
      ro.disconnect()
      cancelAnimationFrame(rafIdRef.current)
      const model = sceneRef.current?.children.find(c => c.type === "Group")
      if (model) disposeObject(model)
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      rendererRef.current = null
      mixerRef.current    = null
      sceneRef.current    = null
      cameraRef.current   = null
      delete (window as Window & { __bike3dLoaded?: boolean }).__bike3dLoaded
    }

    // Load the GLB through fetch so progress is based on real downloaded bytes.
    loadGltfWithProgress("/models/bike.glb", abortController.signal)
      .then(gltf => {
        if (cancelled) return

        // rotate model: -90° around Y so handlebar faces +X (right in frame)
        gltf.scene.rotation.y = Math.PI / 2

        scene.add(gltf.scene)

        // flat fill gives consistent colour regardless of face orientation — avoids washout
        const fillMat = new THREE.MeshBasicMaterial({ color: 0xc8c3bd })
        const edgeMat = new THREE.LineBasicMaterial({ color: 0x1a1a1a })

        gltf.scene.traverse(child => {
          if (!(child instanceof THREE.Mesh)) return

          child.material = fillMat

          // sharp edges only (≥15° crease angle) — mimics Freestyle line art
          const edges = new THREE.EdgesGeometry(child.geometry, 15)
          child.add(new THREE.LineSegments(edges, edgeMat))
        })

        // fit camera to bounding box
        const box    = new THREE.Box3().setFromObject(gltf.scene)
        const center = box.getCenter(new THREE.Vector3())
        const size   = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const fov    = camera.fov * (Math.PI / 180)
        const dist   = (maxDim / 2) / Math.tan(fov / 2)

        // side view with ~20° elevation to match reference overhead tilt
        camera.position.set(
          center.x - dist * 0.1,
          center.y + dist * 0.38,
          center.z + dist * 0.95,
        )
        camera.lookAt(center)
        camera.near = dist / 100
        camera.far  = dist * 10
        camera.updateProjectionMatrix()

        // animation mixer — all 26 clips, LoopOnce so setTime() never wraps
        const mixer = new THREE.AnimationMixer(gltf.scene)
        gltf.animations.forEach(clip => {
          const action = mixer.clipAction(clip)
          action.setLoop(THREE.LoopOnce, 1)
          action.clampWhenFinished = true
          action.play()
        })
        mixerRef.current = mixer
        const clipDuration = gltf.animations[0]?.duration ?? 4
        durationRef.current = clipDuration

        // Blender animation is cyclic: assembled(t=0) → exploded(t≈75%) → assembled(t=end)
        // Usable explode range is [0, duration*0.75]; scrub reversed so top=exploded, bottom=assembled
        const scrubEnd = clipDuration * 0.75
        scrubEndRef.current = scrubEnd

        // sync to current scroll position (browser may have restored non-zero scroll)
        const section = sectionRef.current
        if (section) {
          const rect = section.getBoundingClientRect()
          const scrollable = section.offsetHeight - window.innerHeight
          progressRef.current = Math.max(0, Math.min(1, -rect.top / scrollable))
        }
        mixer.setTime((1 - progressRef.current) * scrubEnd)
        renderer.render(scene, camera)

        setLoaded(true)
      })
      .catch(err => {
        if (!cancelled && !(err instanceof DOMException && err.name === "AbortError")) {
          console.error("[BikeHero3D] GLTF load error:", err)
          cleanup()
          setFailed(true)
          signalLoaded()
        }
      })

    return () => {
      cancelled = true
      abortController.abort()
      cleanup()
    }
  }, [tier])

  // ── 3. scroll → mixer.setTime + rAF render loop ────────────────────────────
  useEffect(() => {
    if (!loaded) return

    const onScroll = () => {
      const section = sectionRef.current
      if (!section) return
      const rect      = section.getBoundingClientRect()
      const scrollable = section.offsetHeight - window.innerHeight
      progressRef.current = Math.max(0, Math.min(1, -rect.top / scrollable))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    let signalSent = false
    const tick = () => {
      const mixer    = mixerRef.current
      const renderer = rendererRef.current
      const scene    = sceneRef.current
      const camera   = cameraRef.current

      if (mixer && renderer && scene && camera) {
        const t = (1 - progressRef.current) * scrubEndRef.current
        mixer.setTime(t)
        renderer.render(scene, camera)
        if (!signalSent) {
          signalSent = true
          signalLoaded()
        }
      }

      rafIdRef.current = requestAnimationFrame(tick)
    }
    rafIdRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(rafIdRef.current)
      delete (window as Window & { __bike3dLoaded?: boolean }).__bike3dLoaded
    }
  }, [loaded])

  // ── static tier ────────────────────────────────────────────────────────────
  if (tier === "static" || failed) {
    return (
      <section style={{ height: scrollHeight }} className={`relative ${className ?? ""}`}>
        <div className="sticky top-0 h-screen overflow-hidden bg-[#f7f4ee]">
          <div
            className="absolute inset-0 opacity-70"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(216, 184, 146, 0.22), transparent 34%), linear-gradient(135deg, rgba(63, 61, 57, 0.08) 0 1px, transparent 1px 24px)",
            }}
            aria-hidden="true"
          />
          {children}
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} style={{ height: scrollHeight }} className={`relative ${className ?? ""}`}>
      {/*
        perspective on parent, rotateX/Y on child — keeps 3D tilt effect correct.
        Three.js canvas sits inside mountRef; parallaxRef wraps it for CSS tilt.
      */}
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Three.js mounts here */}
        <div
          ref={mountRef}
          className="w-full h-full"
          style={{ opacity: loaded ? 1 : 0 }}
        />

        {/* overlay children (text, scroll hint, etc.) */}
        {loaded && children}
      </div>
    </section>
  )
}
