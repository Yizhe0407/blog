import Link from "next/link"
import {
  MessageCircle,
  GraduationCap,
  FolderOpen,
  Heart,
  Plane,
  BookOpen,
  FileText,
  Palette,
  Code2,
  Tag,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { getAllCategories } from "@/lib/posts"

const ICON_MAP: Record<string, LucideIcon> = {
  design: Palette,
  programming: Code2,
  thoughts: MessageCircle,
  learning: GraduationCap,
  projects: FolderOpen,
  life: Heart,
  travel: Plane,
  books: BookOpen,
  notes: FileText,
}

export default function TopicsPage() {
  const categories = getAllCategories()

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-12 lg:px-[72px] pb-16">
      {/* Page title */}
      <div className="text-center pt-8 pb-10">
        <h1
          className="text-[52px] sm:text-[72px] lg:text-[100px] font-extrabold uppercase tracking-[-0.06em] sm:tracking-[-0.1em] lg:tracking-[-0.13em] leading-none mix-blend-multiply text-[#3f3d39]"
          style={{ fontFamily: "var(--font-comic-relief)" }}
        >
          TOPICS
        </h1>
        <p
          className="mt-3 text-[15px] text-[#a09890]"
        >
          {categories.length} topics · {categories.reduce((s, c) => s + c.count, 0)} notes
        </p>
      </div>

      {/* Topics grid */}
      <div className="flex flex-wrap justify-center gap-5">
        {categories.map((cat) => {
          const Icon: LucideIcon = ICON_MAP[cat.name.toLowerCase()] ?? Tag
          return (
            <Link key={cat.name} href={`/topics/${cat.name}`} className="group block w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)]">
              <div className="flex flex-col items-center justify-center gap-3 h-[152px] rounded-[12px] border border-[#e2d8c8] bg-[#f0e7db] transition-colors duration-200 group-hover:bg-[#d9b893] group-hover:border-transparent">
                <Icon
                  size={36}
                  className="text-[#8b6b4a] transition-colors duration-200 group-hover:text-white"
                />
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className="text-[16px] font-medium capitalize text-[#6b665e] transition-colors duration-200 group-hover:text-white"
                  >
                    {cat.name}
                  </span>
                  <span
                    className="text-[12px] text-[#a09890] transition-colors duration-200 group-hover:text-white/80"
                  >
                    {cat.count} {cat.count === 1 ? "note" : "notes"}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
