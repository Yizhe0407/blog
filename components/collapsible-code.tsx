"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const THRESHOLD = 6

export function CollapsibleCode({
  children,
  lineCount,
  ...preProps
}: {
  children: React.ReactNode
  lineCount: number
} & React.HTMLAttributes<HTMLPreElement>) {
  const [open, setOpen] = useState(false)
  const collapsible = lineCount > THRESHOLD

  return (
    <div className="rounded-xl border border-[#d8cfc3] overflow-hidden">
      <div
        className="mdx-code-scroll"
        style={
          collapsible && !open
            ? { maxHeight: "11rem", overflowY: "auto" }
            : undefined
        }
      >
        <pre {...preProps} className="!mb-0 !border-0 !rounded-none">
          {children}
        </pre>
      </div>

      {collapsible && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-[#d8cfc3] bg-[#ede8de] py-2 text-[12px] font-medium text-[#a8957e] transition-colors hover:bg-[#e8ddd0] hover:text-[#7a5c3e]"
        >
          <ChevronDown
            size={13}
            className="shrink-0 transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
          {open ? "收合" : `展開剩餘 ${lineCount - THRESHOLD} 行`}
        </button>
      )}
    </div>
  )
}
