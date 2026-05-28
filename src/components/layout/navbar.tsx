"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname() || '/'

  const navItems = [
    { href: "/events", label: "Events" },
    { href: "/professionals", label: "Professionals" },
    { href: "/about", label: "About" },
  ]

  return (
    <nav className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center justify-center transition-all">
      <div className="w-full max-w-7xl px-4 md:px-6 flex items-center justify-between">
        
        {/* Brand/Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="text-foreground font-serif font-semibold text-2xl tracking-tight">
            Cusco Bienestar
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
