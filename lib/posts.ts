import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { slugify } from "./utils"

export type Post = {
  slug: string
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  coverImage?: string
}

const POSTS_DIR = path.join(process.cwd(), "content/notes")

export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return []

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"))

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "")
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8")
      const { data } = matter(raw)
      return {
        slug,
        title: data.title ?? slug,
        category: data.category ?? "uncategorized",
        date: data.date ?? "",
        readTime: data.readTime ?? "",
        excerpt: data.excerpt ?? "",
        coverImage: data.coverImage,
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export type Heading = { level: 2 | 3; text: string; id: string }

export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  for (const line of content.split("\n")) {
    const m3 = line.match(/^### (.+)/)
    const m2 = !m3 && line.match(/^## (.+)/)
    if (m2) {
      const text = m2[1].trim()
      headings.push({ level: 2, text, id: slugify(text) })
    } else if (m3) {
      const text = m3[1].trim()
      headings.push({ level: 3, text, id: slugify(text) })
    }
  }
  return headings
}

export type Category = { name: string; count: number }

export function getAllCategories(): Category[] {
  const posts = getAllPosts()
  const counts: Record<string, number> = {}
  for (const post of posts) {
    counts[post.category] = (counts[post.category] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getPostsByCategory(category: string): Post[] {
  return getAllPosts().filter((p) => p.category === category)
}

export function getPostBySlug(slug: string): { meta: Post; content: string } | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(raw)

  return {
    meta: {
      slug,
      title: data.title ?? slug,
      category: data.category ?? "uncategorized",
      date: data.date ?? "",
      readTime: data.readTime ?? "",
      excerpt: data.excerpt ?? "",
      coverImage: data.coverImage,
    },
    content,
  }
}
