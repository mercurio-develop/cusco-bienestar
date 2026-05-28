"use client"

import Link from 'next/link'
import { siteConfig } from '@/lib/config/site'

export function Footer() {
  return (
    <footer className="bg-background text-foreground py-12 px-4 md:px-6 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-center md:text-left">
          <Link href="/" className="text-xl font-serif font-semibold tracking-tight">
            Cusco Bienestar
          </Link>
          <p className="text-sm text-muted-foreground">
            Tu guía de bienestar y espiritualidad en el Valle Sagrado.
          </p>
        </div>

        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig?.name || 'Cusco Bienestar'}. All rights reserved.
      </div>
    </footer>
  )
}
