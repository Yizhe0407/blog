<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Blog 專案 AGENTS 指南

## 回覆語言
- 一律使用繁體中文。

## 專案定位
- 此專案是個人部落格（Next.js App Router），內容來自 `content/notes/*.mdx`。
- 主要頁面：首頁、Notes 列表、單篇文章、Topics。
- 導覽列含外部 Portfolio 連結，網站定位也包含將讀者引導至作品集。

## 技術棧（目前版本）
- Next.js 16.2.1（App Router）
- React 19.2.4
- TypeScript 5.x（strict 開啟）
- Tailwind CSS 4 + `tw-animate-css` + shadcn styles
- MDX（`@next/mdx`, `@mdx-js/*`）
- `gray-matter`（解析 frontmatter）
- `lucide-react`（圖示）

## 常用指令（優先使用 pnpm）
```bash
pnpm dev
pnpm lint
pnpm build
pnpm start
```

## 目錄重點
- `app/`
	- `layout.tsx`：全域字型、Navbar、PageTransition、Footer。
	- `page.tsx`：首頁（Hero + 最新文章卡片）。
	- `notes/page.tsx`：文章列表頁（目前搜尋欄僅 UI，尚未接查詢邏輯）。
	- `notes/[slug]/page.tsx`：文章詳頁（`generateStaticParams`、`notFound`、MDX 載入、相關文章、目錄）。
	- `topics/page.tsx`：主題入口卡片頁。
- `components/`
	- `navbar.tsx`、`page-transition.tsx`、`table-of-contents.tsx` 為 client component。
	- 其餘多數元件維持 server component 友善設計。
- `content/notes/*.mdx`：文章內容來源。
- `lib/posts.ts`：文章清單、單篇讀取、標題擷取。
- `mdx-components.tsx`：MDX 元件樣式與 heading id 生成。

## MDX 與資料規範
- 文章檔名即 slug（例如 `my-post.mdx` -> `/notes/my-post`）。
- frontmatter 欄位預期包含：
	- `title`
	- `category`
	- `date`
	- `readTime`
	- `excerpt`
- 目錄（TOC）目前只擷取 Markdown 文字標題 `##` 與 `###`。
- `slugify` 同時用在：
	- `lib/posts.ts` 的 `extractHeadings`
	- `mdx-components.tsx` 的標題 id
	兩邊規則需保持一致，否則 TOC 錨點會失效。

## 實作守則
- 非必要不要加入 `"use client"`；先以 Server Components 為預設。
- 匯入路徑使用 `@/*` alias。
- 沿用現有視覺語言（暖色系、圓角、Khula/Noto Sans/Inter 字型組合）。
- 外部連結一律加 `target="_blank"` 與 `rel="noopener noreferrer"`。
- 優先小步修改，避免無關重構。

## 已知耦合點（修改時需同步）
- `components/table-of-contents.tsx` 的 `STICKY_OFFSET = 140`，需與 `mdx-components.tsx` 標題 `scroll-mt-[140px]` 一致。
- `app/notes/[slug]/page.tsx` 使用 `import("@/content/notes/${slug}.mdx")` 載入內容；若調整內容目錄或副檔名需一起更新。

## 交付前檢查
- 至少執行一次 `pnpm lint`。
- 若有路由/建置層級變更，執行 `pnpm build`。
- 新增文章時確認 frontmatter 完整、slug 可訪問、TOC 錨點正確。
- 檢查桌機與手機版排版是否維持可讀性。

## 變更原則
- 優先維持現有 API 與 UI 行為。
- 若需引入新依賴，必須有明確必要性並與現有技術棧相容。
- 文件、註解與 commit 訊息建議使用繁體中文，方便專案維護一致性。