"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar({ dict, user }: { dict?: any, user?: any }) {
  const pathname = usePathname() || '/'
  const locale = pathname.split('/')[1] || 'en'
  const langPrefix = ['en', 'es'].includes(locale) ? `/${locale}` : '/en'

  const navItems = [
    { href: "/events", label: "Events" },
    { href: "/professionals", label: "Professionals" },
    { href: "/about", label: "About" },
  ]

  return (
    <nav className="fixed top-0 w-full z-[100] bg-brand-50/95 backdrop-blur-xl border-b border-brand-200 h-16 flex items-center justify-center transition-all shadow-sm">
      <div className="w-full max-w-7xl px-4 md:px-6 flex items-center justify-between">
        
        {/* Brand/Logo */}
        <Link href={langPrefix} className="flex items-center gap-2 group shrink-0">
          <span className="text-brand-900 font-serif font-bold text-xl tracking-wide">
            Cusco Bienestar
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const fullHref = `${langPrefix}${item.href}`
            const isActive = pathname === fullHref || (pathname?.startsWith(fullHref) && item.href !== '/')
            return (
              <Link
                key={item.href}
                href={fullHref}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  isActive ? "text-brand-900" : "text-brand-700 hover:text-brand-900"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
