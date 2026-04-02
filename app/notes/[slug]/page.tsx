import { notFound } from "next/navigation"
import Image from "next/image"
import { Calendar, Clock } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypePrettyCode from "rehype-pretty-code"
import { getAllPosts, getPostBySlug, extractHeadings } from "@/lib/posts"
import { NoteCard } from "@/components/note-card"
import { TableOfContents } from "@/components/table-of-contents"
import { mdxComponents } from "@/mdx-components"

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { meta, content } = post
  const headings = extractHeadings(content)

  const related = getAllPosts().filter((p) => p.slug !== slug).slice(0, 2)

  return (
    <div className="mx-auto max-w-[1200px] px-6 pt-10 pb-20">

      {/* ── Full-width header ─────────────────────────────────────────── */}
      <div className="mb-8 max-w-[820px] mx-auto xl:max-w-none xl:mx-0">
        <span
          className="inline-flex items-center rounded-[3px] bg-[#d8b892] px-2 py-0.5 text-xs font-normal capitalize text-white mb-4"
        >
          {meta.category}
        </span>

        <h1
          className="text-[30px] font-bold text-[#3f3d39] leading-[1.35] capitalize mb-3"
        >
          {meta.title}
        </h1>

        <div
          className="flex items-center gap-3 text-[#a09890] text-[12.5px] mb-7"
        >
          <span className="flex items-center gap-1.5">
            <Calendar size={11} />
            {meta.date}
          </span>
          <span className="w-px h-3 bg-[#c8c0b5]" aria-hidden="true" />
          <span className="flex items-center gap-1.5">
            <Clock size={11} />
            {meta.readTime}
          </span>
        </div>

        {/* Cover image — 16:9 ratio, side margins for breathing room */}
        <div className="mx-4 sm:mx-10 md:mx-16 lg:mx-28 aspect-video rounded-[16px] overflow-hidden bg-[#e2d5c3] border border-[#e2d8c8]">
          {meta.coverImage && (
            <Image
              src={meta.coverImage}
              alt={meta.title}
              width={1200}
              height={675}
              className="h-full w-full object-cover"
              priority
            />
          )}
        </div>
      </div>

      {/* ── Two-column body ───────────────────────────────────────────── */}
      {/*
        xl+: flex two-column (article + TOC aside).
        Below xl: block, article centered with mx-auto.
      */}
      <div className="xl:flex xl:gap-10">

        <article className="min-w-0 xl:flex-1 max-w-[820px] mx-auto xl:mx-0">
          <div className="mdx-body">
            <MDXRemote
              source={content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [
                    [rehypePrettyCode, {
                      theme: "rose-pine-dawn",
                      keepBackground: false,
                      defaultLang: "plaintext",
                    }],
                  ],
                },
              }}
            />
          </div>

          {related.length > 0 && (
            <section className="mt-16">
              <hr className="border-[#e2d8c8] mb-8" />
              <h2
                className="text-[22px] font-semibold text-[#3f3d39] capitalize mb-6"
              >
                See related posts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                {related.map((p) => (
                  <NoteCard key={p.slug} post={p} />
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="hidden xl:block w-[260px] shrink-0 pt-10">
          <div className="sticky top-[130px]">
            <TableOfContents headings={headings} />
          </div>
        </aside>

      </div>

    </div>
  )
}
