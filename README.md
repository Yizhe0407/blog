# blog.yizhe.dev — 個人部落格

以 Next.js App Router 建置的個人部落格，文章以 MDX 撰寫，支援語法高亮、目錄導覽與主題分類。

## 技術棧

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5** (strict)
- **Tailwind CSS 4**
- **MDX** (`@next/mdx` + `rehype-pretty-code`)
- **shadcn/ui** + `lucide-react`

## 專案結構

```
app/
├── page.tsx              # 首頁（Hero + 最新文章）
├── notes/
│   ├── page.tsx          # 文章列表
│   └── [slug]/page.tsx   # 文章詳頁（MDX + TOC）
└── topics/page.tsx       # 主題分類頁

content/notes/*.mdx       # 文章來源
components/               # UI 元件
lib/posts.ts              # 文章讀取與 heading 擷取
```

## 本地開發

```bash
pnpm install
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

## 新增文章

在 `content/notes/` 新增 `.mdx` 檔，檔名即為 slug：

```mdx
---
title: 文章標題
category: 分類
date: 2024-01-01
readTime: 5 min
excerpt: 摘要文字
coverImage: https://example.com/image.png (可選)
---

內文...
```

## 指令

| 指令 | 說明 |
|------|------|
| `pnpm dev` | 啟動開發伺服器 |
| `pnpm build` | 建置生產版本 |
| `pnpm start` | 啟動生產伺服器 |
| `pnpm lint` | 執行 ESLint |

## Docker

```bash
# 建置並啟動（port 3000）
docker compose up --build

# 背景執行
docker compose up --build -d

# 停止
docker compose down
```
