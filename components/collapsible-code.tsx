"use client"

import React, { useState } from "react"

const COLLAPSE_THRESHOLD = 20

interface CollapsibleCodeProps extends React.HTMLAttributes<HTMLPreElement> {
  lineCount: number
  children?: React.ReactNode
}

export function CollapsibleCode({ lineCount, children, ...props }: CollapsibleCodeProps) {
  const shouldCollapse = lineCount > COLLAPSE_THRESHOLD
  const [expanded, setExpanded] = useState(false)

  if (!shouldCollapse) {
    return (
      <pre
        {...props}
        className={`my-5 overflow-x-auto rounded-xl border border-[#e2d8c8] bg-[#faf7f2] p-4 text-[13.5px] leading-[1.7] ${props.className ?? ""}`}
      >
        {children}
      </pre>
    )
  }

  return (
    <div className="relative my-5">
      <pre
        {...props}
        className={`overflow-x-auto rounded-xl border border-[#e2d8c8] bg-[#faf7f2] p-4 text-[13.5px] leading-[1.7] transition-all duration-300 ${
          expanded ? "" : "max-h-[320px]"
        } ${props.className ?? ""}`}
        style={{
          ...(props.style ?? {}),
          overflow: expanded ? "auto" : "hidden",
        }}
      >
        {children}
      </pre>

      {!expanded && (
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 rounded-b-xl bg-gradient-to-t from-[#faf7f2] to-transparent" />
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-1 w-full rounded-lg border border-[#e2d8c8] bg-[#f0ebe3] py-1.5 text-[12.5px] font-medium text-[#8b6b4a] hover:bg-[#e8dfd4] hover:text-[#3f3d39] transition-colors"
      >
        {expanded ? "折疊程式碼" : `展開全部 ${lineCount} 行`}
      </button>
    </div>
  )
}
