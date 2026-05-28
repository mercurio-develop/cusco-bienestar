"use client"

import Link from 'next/link'
import { siteConfig } from '@/lib/config/site'

export function Footer({ lang }: { lang: string }) {
  const isEs = lang === 'es'

  return (
    <footer className="bg-brand-900 text-brand-100 py-12 px-6 border-t border-brand-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-2 text-center md:text-left">
          <Link href={`/${lang}`} className="text-xl font-serif font-bold text-white tracking-tight">
            Cusco Bienestar
          </Link>
          <p className="text-sm text-brand-300">
            {isEs 
              ? "Tu guía de bienestar y espiritualidad en el Valle Sagrado."
              : "Your wellness and spiritual guide in the Sacred Valley."}
          </p>
        </div>

        <div className="flex gap-6 text-sm text-brand-300">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-brand-800 text-center text-xs text-brand-400">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  )
}
