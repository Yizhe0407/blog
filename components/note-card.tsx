import Link from "next/link"
import Image from "next/image"
import { Calendar, Clock } from "lucide-react"
import type { Post } from "@/lib/posts"

export function NoteCard({ post }: { post: Post }) {
  return (
    <Link href={`/notes/${post.slug}`} className="group block">
      {/* Image — standalone rounded box, no relation to a "card" container */}
      <div className="aspect-[3/2] w-full rounded-[20px] overflow-hidden bg-[#efe7db] border border-[#e2d8c8]">
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        )}
      </div>

      {/* Content floats below the image on the page background */}
      <div className="mt-8">
        {/* Category badge */}
        <span className="inline-flex items-center rounded-[3px] bg-[#d8b892] px-2 py-1 text-[12px] leading-none capitalize text-white">
          {post.category}
        </span>

        {/* Title */}
        <h2 className="mt-1 text-[27px] font-semibold leading-[1.4] capitalize text-[#3f3d39] line-clamp-2">
          {post.title}
        </h2>

        {/* Meta row */}
        <div className="mt-7 flex items-center gap-2 text-[12px] capitalize text-[#777]">
          <Calendar size={12} className="shrink-0" />
          <span>{post.date}</span>
          <span className="h-3 w-px bg-[#c8c0b5]" aria-hidden="true" />
          <Clock size={12} className="shrink-0" />
          <span>{post.readTime}</span>
        </div>

        {/* Excerpt */}
        <p className="mt-4 text-[15px] text-[#6b665e] leading-[1.5] line-clamp-2">
          {post.excerpt}
        </p>
      </div>
    </Link>
  )
}