import { BikeHero3D } from "@/components/bike-hero-3d-loader"
import { NoteCard } from "@/components/note-card"
import { getAllPosts } from "@/lib/posts"

export default function HomePage() {
  const posts = getAllPosts()

  return (
    <>
      <BikeHero3D
        scrollHeight="150vh"
        className="-mt-[84px] sm:-mt-[122px]"
      >
        {/* top-right tagline */}
        <div className="absolute top-[100px] sm:top-[140px] right-8 sm:right-24 max-w-[180px] sm:max-w-[240px] flex flex-col gap-2 text-right pointer-events-none">
          <p
            className="text-[18px] sm:text-[24px] font-extrabold leading-tight text-[#3f3d39]"
            style={{ fontFamily: "var(--font-comic-relief)" }}
          >
            Ideas, assembled.
          </p>
          <p
            className="text-[12px] sm:text-[14px] font-normal leading-relaxed text-[#6b665e]"
            style={{ fontFamily: "var(--font-comic-relief)" }}
          >
            A blog where scattered thoughts come together — just like a bike.
          </p>
        </div>

        {/* bottom-left tagline */}
        <div className="absolute bottom-12 sm:bottom-16 left-8 sm:left-24 max-w-[160px] sm:max-w-[220px] flex flex-col gap-1 pointer-events-none">
          <p
            className="text-[18px] sm:text-[22px] font-extrabold leading-tight text-[#3f3d39]"
            style={{ fontFamily: "var(--font-comic-relief)" }}
          >
            Ride.
            <br />
            Read.
            <br />
            Reflect.
          </p>
          <p
            className="text-[12px] sm:text-[13px] font-normal leading-relaxed text-[#6b665e]"
            style={{ fontFamily: "var(--font-comic-relief)" }}
          >
            Notes from someone who thinks on two wheels.
          </p>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 right-1/2 translate-x-1/2 pointer-events-none">
          <svg
            className="animate-bounce"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 3v14M4 11l6 6 6-6"
              stroke="#c5bdb2"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </BikeHero3D>

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
