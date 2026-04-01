import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-6 py-24">
      <p
        className="text-[200px] leading-none text-[#d8b892] select-none"
        style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}
      >
        404
      </p>

      <p
        className="mt-4 text-[17px] font-medium capitalize text-[#3f3d39]"
      >
        The page you are looking for does not exist!
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-[19px] font-semibold capitalize text-[#d8b892] hover:text-[#8b6b4a] transition-colors"
      >
        <ArrowLeft size={20} />
        Back to homepage
      </Link>
    </div>
  )
}
