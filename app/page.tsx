import { BikeHero } from "@/components/bike-hero"
import { NoteCard } from "@/components/note-card"
import { getAllPosts } from "@/lib/posts"

export default function HomePage() {
  const posts = getAllPosts()

  return (
    <>
      <BikeHero />

      <section className="mx-auto max-w-[1440px] px-5 sm:px-8 md:px-12 lg:px-[72px] pb-16">
        <div className="mb-6 flex items-center gap-1.5">
          <span
            className="inline-block rounded-[5px] bg-[#d8b892] px-2 py-0.5 text-base font-semibold capitalize text-white leading-[1.4]"
          >
            Latest
          </span>
          <span
            className="text-base font-semibold capitalize text-[#3f3d39] leading-[1.4]"
          >
            Posted
          </span>
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <NoteCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  )
}
