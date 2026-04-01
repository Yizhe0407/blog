"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import { NoteCard } from "@/components/note-card"
import type { Post } from "@/lib/posts"

export function NotesSearch({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()
  const filtered = q
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
    : posts

  return (
    <>
      {/* Search bar */}
      <div className="mx-auto max-w-[736px] mb-10">
        <div className="flex items-center gap-2 rounded-[10px] border border-[#e7e1d7] bg-[rgba(251,249,244,0.93)] px-4 py-3">
          <Search size={18} className="text-[rgba(60,60,67,0.6)] shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋標題、摘要、分類…"
            className="flex-1 bg-transparent text-[17px] text-[#3f3d39] placeholder:text-[rgba(60,60,67,0.6)] outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[rgba(60,60,67,0.5)] hover:text-[#3f3d39] transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <NoteCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p
          className="text-center text-[#9b9189] text-[16px] py-16"
        >
          找不到符合「{query}」的文章。
        </p>
      )}
    </>
  )
}
