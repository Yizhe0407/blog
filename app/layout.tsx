import type { Metadata } from "next"
import { Comic_Relief } from "next/font/google"
import localFont from "next/font/local"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PageTransition } from "@/components/page-transition"
import { HomepageLoader } from "@/components/homepage-loader"
import "./globals.css"

const comicRelief = Comic_Relief({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-comic-relief",
  display: "swap",
  adjustFontFallback: false,
})

const openHuninn = localFont({
  src: "../public/fonts/jf-openhuninn-2.1.ttf",
  variable: "--font-open-huninn",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Yizhe | Blog",
  description:
    "A personal space for ideas, notes, reflections, and everything I find worth keeping.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${comicRelief.variable} ${openHuninn.variable}`}
    >
      <body className="bg-[#f7f4ee] min-h-screen antialiased flex flex-col">
        <HomepageLoader />
        <Navbar />
        <main className="flex-1 pt-[84px] sm:pt-[122px]">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  )
}
