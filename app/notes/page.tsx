import { getAllPosts } from "@/lib/posts"
import { NotesSearch } from "@/components/notes-search"

export default function NotesPage() {
  const posts = getAllPosts()

  return (
    <div className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-12 lg:px-[72px] pb-16">
      {/* Page title */}
      <div className="text-center pt-8 pb-6">
        <h1
          className="text-[52px] sm:text-[72px] lg:text-[100px] font-extrabold uppercase tracking-[-0.06em] sm:tracking-[-0.1em] lg:tracking-[-0.13em] leading-none mix-blend-multiply text-[#3f3d39]"
          style={{ fontFamily: "var(--font-comic-relief)" }}
        >
          NOTES
        </h1>
      </div>

      <NotesSearch posts={posts} />
    </div>
  )
}
