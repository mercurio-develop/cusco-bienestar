import { CATEGORIES } from "@/features/discovery/constants"
import { siteConfig } from "@/lib/config/site"
import type { Metadata } from "next"
import Link from "next/link"
import { JsonLd } from "@/components/ui/json-ld"

interface PageProps {
  params: Promise<{ lang: string }>
}

const CATEGORY_EMOJIS: Record<string, string> = {
  Wellness: "🌿",
  Spiritual: "✨",
  Adventure: "⛰️",
  Culture: "🏛️",
  Dining: "🍽️",
  Stays: "🛏️",
}

const FEATURED_CATEGORY_VALUES = ["Wellness", "Spiritual", "Adventure", "Culture", "Dining", "Stays"]

const featuredCategories = CATEGORIES.filter(cat =>
  FEATURED_CATEGORY_VALUES.includes(cat.value)
).map(cat => ({
  ...cat,
  emoji: CATEGORY_EMOJIS[cat.value] ?? "🌟",
  slug: cat.value.toLowerCase(),
}))

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const isEs = lang === 'es'
  const title = isEs
    ? "Directorio de Bienestar en Cusco y el Valle Sagrado | CUSCO BIENESTAR"
    : "Wellness Directory in Cusco & the Sacred Valley | CUSCO BIENESTAR"
  const description = isEs
    ? "Descubre experiencias de bienestar en Cusco y el Valle Sagrado: yoga, meditación, retiros espirituales, terapias y más. Reserva directamente."
    : "Discover wellness experiences in Cusco and the Sacred Valley: yoga, meditation, spiritual retreats, therapies and more. Book directly."

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${lang}`,
      languages: {
        en: `${siteConfig.url}/en`,
        es: `${siteConfig.url}/es`,
        'x-default': `${siteConfig.url}/en`,
      }
    }
  }
}

export default async function HomePage({ params }: PageProps) {
  const { lang } = await params

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteConfig.name,
    "url": siteConfig.url,
    "description": siteConfig.description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteConfig.url}/${lang}/explore?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <div className="bg-white">
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="px-6 py-20 md:py-32 max-w-3xl mx-auto text-center">
        <p className="text-sm font-bold text-rose-600 uppercase tracking-widest mb-6">
          Cusco &amp; Valle Sagrado
        </p>
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
          Experiencias de bienestar en Cusco y el Valle Sagrado
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-10">
          Yoga, meditación, retiros espirituales, terapias y más — reserva directamente.
        </p>
        <Link
          href="/explore"
          className="inline-block bg-rose-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-rose-700 transition-colors"
        >
          Explorar experiencias →
        </Link>
      </section>

      {/* Category grid */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3">
          {featuredCategories.map(cat => (
            <Link
              key={cat.value}
              href={`/explore?category=${cat.slug}`}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all hover:shadow-md ${cat.theme}`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
