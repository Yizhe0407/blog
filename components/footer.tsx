import { socialLinks } from "@/lib/social-links"

export function Footer() {
  return (
    <footer className="flex flex-col items-center pb-8 pt-12">
      <div className="flex items-center gap-6 py-6">
        {socialLinks.map(({ label, href, icon: Icon }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8b6b4a] hover:text-[#3f3d39] transition-colors"
          >
            <Icon size={24} />
          </a>
        ))}
      </div>

      <p
        className="text-[#6b665e] text-[15px] text-center"
      >
        Copyright &copy; 2026 Liao Yizhe &mdash; All rights reserved
      </p>
    </footer>
  )
}
