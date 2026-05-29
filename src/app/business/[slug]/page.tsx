/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma"
export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { MapPin, MessageCircle } from "lucide-react"
import { siteConfig } from "@/lib/config/site"
import { SafeImageWrapper } from "@/components/ui/safe-image"
import { getDictionary, Locale } from "@/lib/dictionaries"

interface BusinessPageProps {
  params: Promise<{ slug: string, lang: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export const revalidate = 86400; // Cache for 1 day

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug, lang } = await params
  const business = await prisma.business.findUnique({
    where: { slug: slug },
    include: { premiumProfile: true }
  })

  if (!business) {
    return { title: 'Not Found | Cusco Bienestar' }
  }

  const isEs = lang === 'es'
  const bName = isEs && business.nameEs ? business.nameEs : business.name
  const bCategory = isEs && business.categoryEs ? business.categoryEs : business.category
  const bTagline = isEs && business.taglineEs ? business.taglineEs : business.tagline
  const bSeoMetaTitle = isEs && business.seoMetaTitleEs ? business.seoMetaTitleEs : business.seoMetaTitle
  const bSeoMetaDesc = isEs && business.seoMetaDescEs ? business.seoMetaDescEs : business.seoMetaDesc

  const categoryName = bCategory ? bCategory.charAt(0).toUpperCase() + bCategory.slice(1).toLowerCase() : bCategory
  const locationName = business.locationSlug ? business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1) : (isEs ? "el Valle Sagrado" : "the Sacred Valley")
  const title = bSeoMetaTitle || `${bName} — ${categoryName} ${isEs ? 'en' : 'in'} ${locationName}`
  const description = bSeoMetaDesc || bTagline || (isEs ? `Lee reseñas, mira fotos y contacta a ${bName} directamente. Calificación: ${business.rating?.toFixed(1) || 'Nuevo'} estrellas.` : `Read reviews, view photos, and contact ${bName} directamente. Average rating: ${business.rating?.toFixed(1) || 'New'} stars.`)

  const ogImage = business.premiumProfile?.coverPhotoUrl || business.premiumProfile?.logoUrl || `/api/og?title=${encodeURIComponent(bName || 'Cusco Bienestar')}&description=${encodeURIComponent((categoryName || '') + (isEs ? ' en ' : ' in ') + locationName)}&image=${encodeURIComponent(business.imageUrl || '')}${business.rating ? '&rating=' + business.rating : ''}`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/${lang}/business/${business.slug}`,
      languages: {
        en: `${siteConfig.url}/en/business/${business.slug}`,
        es: `${siteConfig.url}/es/business/${business.slug}`,
        'x-default': `${siteConfig.url}/en/business/${business.slug}`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/${lang}/business/${business.slug}`,
      siteName: "Cusco Bienestar",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${bName} - ${categoryName}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function BusinessPage({ params, searchParams }: BusinessPageProps) {
  const { slug, lang } = await params
  
  const isEs = lang === 'es'

  const business = await prisma.business.findUnique({
    where: { slug: slug },
    include: { premiumProfile: true }
  })

  if (!business) return notFound()

  // Use longDescription if available, fallback to short description
  business.description = business.longDescription || business.description

  if (isEs) {
    business.name = business.nameEs || business.name
    business.category = business.categoryEs || business.category
    business.description = business.longDescriptionEs || business.descriptionEs || business.description
  }

  const categoryName = business.category ? business.category.charAt(0).toUpperCase() + business.category.slice(1).toLowerCase() : business.category
  const locationName = business.locationSlug ? business.locationSlug.charAt(0).toUpperCase() + business.locationSlug.slice(1) : (isEs ? "el Valle Sagrado" : "the Sacred Valley")
  const bName = business.name

  const heroImage = business.imageUrl || business.premiumProfile?.coverPhotoUrl || '/images/og-default.jpg'
  
  // Format WhatsApp message
  const whatsappMsg = encodeURIComponent(
    isEs 
      ? `¡Hola ${bName}! 👋 Vi su perfil en Cusco Bienestar y me gustaría hacer una consulta.`
      : `Hello ${bName}! 👋 I saw your profile on Cusco Bienestar and I'd like to make an inquiry.`
  )

  const schemaTypeMap: Record<string, string> = {
    'DINING': 'Restaurant',
    'AGENCY': 'TravelAgency',
    'WELLNESS': 'HealthAndBeautyBusiness',
    'STAYS': 'LodgingBusiness',
    'CULTURE': 'TouristAttraction',
  }
  const businessType = schemaTypeMap[business.category || ''] || 'LocalBusiness'

  let socialLinks: any[] = []
  try {
    const parsed = business.socialLinks ? JSON.parse(business.socialLinks) : []
    socialLinks = Array.isArray(parsed) ? parsed : []
  } catch(e) {
      console.warn("Failed to parse social links", e)
  }
  
  const sameAsLinks = socialLinks.map((s) => s.url).filter(Boolean)
  if (business.instagramHandle) {
    sameAsLinks.push(`https://instagram.com/${business.instagramHandle.replace('@', '')}`)
  }

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": businessType,
    "name": business.name || 'Business',
    "image": heroImage ? [heroImage] : undefined,
    "description": business.description || business.tagline || '',
    "url": `${siteConfig.url}/${lang}/business/${business.slug}`,
    "telephone": business.whatsapp ? `+51${business.whatsapp.replace(/\D/g, '')}` : undefined,
    "priceRange": business.priceTier || "$$",
    "sameAs": sameAsLinks.length > 0 ? sameAsLinks : undefined,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": locationName || '',
      "addressRegion": "Cusco",
      "addressCountry": "PE"
    },
    "geo": (business.lat && business.lng) ? {
      "@type": "GeoCoordinates",
      "latitude": business.lat,
      "longitude": business.lng
    } : undefined,
    "aggregateRating": (business.rating && business.reviewsCount) ? {
      "@type": "AggregateRating",
      "ratingValue": business.rating,
      "reviewCount": business.reviewsCount
    } : undefined
  };
  
  return (
    <main className="min-h-screen bg-white pb-24 selection:bg-rose-100 selection:text-rose-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 1. Hero Image */}
      <section className="relative w-full h-[50vh] min-h-[400px]">
        <SafeImageWrapper 
          src={heroImage} 
          alt={bName || ''} 
          wrapperClassName="w-full h-full"
          imgClassName="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="absolute top-6 left-6 z-10">
          <Link href={`/${lang}/explore`} className="inline-flex items-center text-white bg-black/30 hover:bg-black/50 px-5 py-2.5 rounded-full backdrop-blur-md text-sm font-medium transition-colors border border-white/10">
            ← {isEs ? 'Volver' : 'Back'}
          </Link>
        </div>
      </section>

      {/* 2. Header and Content */}
      <div className="max-w-3xl mx-auto px-6 pt-12">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-bold tracking-widest uppercase mb-6">
          <span className="bg-slate-100 px-3 py-1 rounded-full text-slate-700">{categoryName}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {locationName}
          </span>
        </div>

        <h1 className="text-4xl lg:text-5xl font-serif text-slate-900 leading-tight mb-8">
          {bName}
        </h1>

        <div className="prose prose-lg prose-slate max-w-none mb-12">
          {business.description ? (
             <p className="whitespace-pre-line leading-relaxed text-slate-700 text-lg">
               {business.description}
             </p>
          ) : (
            <p className="text-slate-400 italic">
              {isEs ? 'No hay descripción disponible.' : 'No description available.'}
            </p>
          )}
        </div>

        {/* 3. Contact Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          {business.whatsapp && (
            <a
              href={`https://wa.me/51${business.whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center py-4 px-6 rounded-xl text-white font-medium text-lg bg-[#25D366] hover:bg-[#20bd5a] transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp {isEs ? 'directo' : 'direct'}
            </a>
          )}
          {business.instagramHandle && (
            <a
              href={`https://instagram.com/${business.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center py-4 px-6 rounded-xl text-slate-900 font-medium text-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              Instagram
            </a>
          )}
        </div>

        {/* 4. Map Section */}
        {(business.lat && business.lng) && (
          <div className="w-full h-[400px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps/embed/v1/place?q=${business.lat},${business.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}`}
            ></iframe>
          </div>
        )}
      </div>
    </main>
  )
}
