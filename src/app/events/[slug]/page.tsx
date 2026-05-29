import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Star, MessageCircle, MapPin, Calendar } from "lucide-react"
import { SafeImageWrapper } from "@/components/ui/safe-image"
import { ScrollCarousel } from "@/components/ui/scroll-carousel"
import { ExpandableText } from "@/components/ui/expandable-text"
import { BackButton } from "@/components/ui/back-button"
import { siteConfig } from "@/lib/config/site"

const EVENT_CATEGORIES = ["spiritual", "adventure", "wellness", "culture"]

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 86400

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await prisma.business.findUnique({
    where: { slug },
    select: { name: true, category: true, tagline: true, imageUrl: true, rating: true, locationSlug: true },
  })

  if (!event) return { title: "Not Found | Cusco Bienestar" }

  const locationName = event.locationSlug
    ? event.locationSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Sacred Valley"

  const title = `${event.name} — ${event.category} in ${locationName} | Cusco Bienestar`
  const description =
    event.tagline ||
    `Discover ${event.name}, a unique experience in ${locationName}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/events/${slug}`,
      images: event.imageUrl ? [{ url: event.imageUrl, width: 1200, height: 630 }] : [],
    },
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params

  const event = await prisma.business.findUnique({
    where: { slug },
    include: { reviews: true, services: true, tourPackages: true },
  })

  if (
    !event ||
    !EVENT_CATEGORIES.includes(event.category?.toLowerCase() ?? "")
  ) {
    return notFound()
  }

  const description = event.longDescription || event.description

  // Build images array
  const images: string[] = []
  if (event.imageUrl) images.push(event.imageUrl)
  try {
    const heroImages = event.heroImages ? JSON.parse(event.heroImages) : []
    if (Array.isArray(heroImages)) images.push(...heroImages)
  } catch {
    // ignore malformed JSON
  }

  const locationName = event.locationSlug
    ? event.locationSlug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Sacred Valley"

  const categoryLabel =
    event.category
      ? event.category.charAt(0).toUpperCase() + event.category.slice(1).toLowerCase()
      : ""

  const whatsappMsg = encodeURIComponent(
    `Hello ${event.name}! 👋 I saw your listing on Cusco Bienestar and I'd like to learn more about this experience. When is the next available date?`
  )
  const whatsappHref = event.whatsapp
    ? `https://wa.me/51${event.whatsapp.replace(/\D/g, "")}?text=${whatsappMsg}`
    : null

  const instagramHandle = event.instagramHandle?.replace("@", "")
  const instagramHref = instagramHandle ? `https://instagram.com/${instagramHandle}` : null

  const canContact = event.isAsociado && whatsappHref

  return (
    <main className="min-h-screen bg-gray-50 pb-24 lg:pb-12">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-50">
        <BackButton fallbackHref="/events" label="Events" className="bg-white/80 backdrop-blur-md shadow-sm" />
      </div>

      {/* Hero Image Carousel */}
      <section className="relative w-full h-[40vh] min-h-[280px] lg:h-[50vh] lg:max-w-6xl lg:mx-auto lg:rounded-b-3xl overflow-hidden bg-slate-200 shadow-sm">
        {images.length > 0 ? (
          <ScrollCarousel className="w-full h-full">
            {images.map((url, i) => (
              <div key={i} className="relative w-screen lg:w-full h-[40vh] min-h-[280px] lg:h-[50vh] flex-shrink-0">
                <SafeImageWrapper
                  src={url}
                  alt={event.name}
                  wrapperClassName="w-full h-full"
                  imgClassName="w-full h-full object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </ScrollCarousel>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-200" />
        )}

        {/* Rating badge */}
        {event.rating != null && (
          <div className="absolute -bottom-4 right-4 z-10 bg-white px-4 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-1 lg:hidden">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-sm text-slate-900">{event.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-500 ml-1">({event.reviewsCount || 0})</span>
          </div>
        )}
      </section>

      {/* Main Grid */}
      <div className="lg:max-w-6xl lg:mx-auto lg:px-6 lg:py-12 lg:grid lg:grid-cols-3 lg:gap-12">

        {/* Left Column */}
        <div className="lg:col-span-2">

          {/* Header */}
          <section className="px-4 lg:px-0 pt-8 lg:pt-0 pb-6 bg-white lg:bg-transparent -mt-6 lg:mt-0 relative z-20 rounded-t-[2rem] lg:rounded-none">
            <h1 className="text-3xl lg:text-4xl font-serif text-slate-900 leading-tight">
              {event.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-slate-600 mb-6">
              <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-700">{categoryLabel}</span>
              {event.priceTier && (
                <>
                  <span>•</span>
                  <span className="font-medium">{event.priceTier}</span>
                </>
              )}
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{locationName}</span>
              </div>
            </div>

            {description && (
              <div className="mt-2">
                <ExpandableText text={description} maxLength={220} />
              </div>
            )}
          </section>

          {/* Tour Packages */}
          {event.tourPackages.length > 0 && (
            <section className="px-4 lg:px-0 py-8 bg-white lg:bg-transparent border-t border-slate-100 lg:border-0">
              <h2 className="text-xl lg:text-2xl font-serif text-slate-900 mb-6">Packages & Experiences</h2>
              <div className="space-y-4">
                {event.tourPackages.map((pkg) => (
                  <div key={pkg.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{pkg.title}</p>
                        {pkg.tagline && <p className="text-sm text-slate-500 mt-0.5">{pkg.tagline}</p>}
                        {pkg.description && (
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-3">{pkg.description}</p>
                        )}
                        {pkg.durationDays != null && (
                          <div className="flex items-center gap-1 mt-2 text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs">{pkg.durationDays} day{pkg.durationDays !== 1 ? "s" : ""}</span>
                          </div>
                        )}
                      </div>
                      {pkg.basePriceUsd != null && (
                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-900">${pkg.basePriceUsd}</span>
                          <p className="text-xs text-slate-400">per person</p>
                        </div>
                      )}
                    </div>
                    {(() => {
                      try {
                        const highlights: string[] = JSON.parse(pkg.highlights)
                        if (!Array.isArray(highlights) || highlights.length === 0) return null
                        return (
                          <ul className="mt-3 space-y-1">
                            {highlights.slice(0, 4).map((h, i) => (
                              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                <span className="text-emerald-500 mt-0.5">✓</span>
                                {h}
                              </li>
                            ))}
                          </ul>
                        )
                      } catch { return null }
                    })()}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Services */}
          {event.services.length > 0 && (
            <section className="px-4 lg:px-0 py-8 bg-white lg:bg-transparent border-t border-slate-100 lg:border-0">
              <h2 className="text-xl lg:text-2xl font-serif text-slate-900 mb-6">Included Services</h2>
              <div className="space-y-3">
                {event.services.map((service) => (
                  <div key={service.id} className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">{service.title}</p>
                      {service.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{service.description}</p>
                      )}
                    </div>
                    {service.priceUsd != null && (
                      <span className="font-bold text-slate-900 text-sm shrink-0">${service.priceUsd}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          {event.reviews.length > 0 && (
            <section className="px-4 lg:px-0 py-8 bg-slate-50 lg:bg-transparent border-t border-slate-100">
              <h2 className="text-xl lg:text-2xl font-serif text-slate-900 mb-6">Reviews</h2>
              <ScrollCarousel className="-mx-4 px-4 pb-4 lg:mx-0 lg:px-0">
                {event.reviews.map((review) => (
                  <div key={review.id} className="w-[280px] lg:w-[320px] flex-shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                        {review.author?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{review.author}</p>
                        <div className="flex mt-0.5">
                          {[...Array(review.rating || 5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <ExpandableText text={review.text || ""} maxLength={180} />
                  </div>
                ))}
              </ScrollCarousel>
            </section>
          )}
        </div>

        {/* Right Column — Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 space-y-4">
            {/* Rating */}
            {event.rating != null && (
              <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-100">
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-2xl text-slate-900">{event.rating.toFixed(1)}</span>
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {event.reviewsCount || 0} reviews
                </span>
              </div>
            )}

            {/* WhatsApp */}
            {canContact ? (
              <a
                href={whatsappHref!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full py-4 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[15px] shadow-sm transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact via WhatsApp
              </a>
            ) : (
              <button
                disabled
                className="flex items-center justify-center w-full py-4 px-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-[15px]"
              >
                WhatsApp Not Available
              </button>
            )}

            {/* Instagram */}
            {instagramHref ? (
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full py-4 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-[15px] shadow-sm transition-opacity hover:opacity-90"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                View on Instagram
              </a>
            ) : null}

            <p className="text-center text-xs font-medium text-slate-400 uppercase tracking-widest">
              Usually replies within 1 hour
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-40 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-3">
          {canContact ? (
            <a
              href={whatsappHref!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center py-3.5 px-4 rounded-xl bg-emerald-500 text-white font-medium text-[15px] shadow-sm"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </a>
          ) : (
            <button
              disabled
              className="flex-1 flex items-center justify-center py-3.5 px-4 rounded-xl bg-slate-100 text-slate-400 font-medium text-[15px]"
            >
              WhatsApp
            </button>
          )}

          {instagramHref ? (
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-[15px] shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </a>
          ) : null}
        </div>
      </div>
    </main>
  )
}
