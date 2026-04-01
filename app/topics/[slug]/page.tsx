import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { getAllCategories, getPostsByCategory } from "@/lib/posts"
import { NoteCard } from "@/components/note-card"

export async function generateStaticParams() {
  return getAllCategories().map((cat) => ({ slug: cat.name }))
}

type Props = { params: Promise<{ slug: string }> }

export default async function TopicPage({ params }: Props) {
  const { slug } = await params
  const posts = getPostsByCategory(slug)
  if (posts.length === 0) notFound()

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-12 lg:px-[72px] pb-16">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-1.5 pt-6 text-[13px] text-[#a09890]"
        aria-label="Breadcrumb"
      >
        <Link href="/topics" className="hover:text-[#6b665e] transition-colors">
          Topics
        </Link>
        <ChevronRight size={12} className="shrink-0 text-[#c8c0b5]" aria-hidden="true" />
        <span className="capitalize text-[#6b665e]">{slug}</span>
      </nav>

      {/* Page title */}
      <div className="text-center pt-6 pb-10">
        <h1
          className="text-[52px] sm:text-[72px] lg:text-[100px] font-extrabold uppercase tracking-[-0.06em] sm:tracking-[-0.1em] lg:tracking-[-0.13em] leading-none mix-blend-multiply text-[#3f3d39]"
          style={{ fontFamily: "var(--font-comic-relief)" }}
        >
          {slug}
        </h1>
        <p
          className="mt-3 text-[15px] text-[#a09890]"
        >
          {posts.length} {posts.length === 1 ? "note" : "notes"}
        </p>
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <NoteCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}
