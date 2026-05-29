import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { getCategoryData } from "@/features/discovery/constants"
import { DirectoryCard } from "@/components/directory/directory-card"

export const revalidate = 3600

const PROFESSIONAL_CATEGORIES = ["Wellness", "Spiritual", "Guide"]

export const metadata: Metadata = {
  title: "Wellness Professionals | Cusco Bienestar",
  description:
    "Find verified wellness practitioners, spiritual guides, and healing professionals in Cusco and the Sacred Valley.",
}

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams

  const activeCategory = category
    ? PROFESSIONAL_CATEGORIES.find((c) => c.toLowerCase() === category.toLowerCase())
    : null

  const filterCategories = activeCategory ? [activeCategory] : PROFESSIONAL_CATEGORIES
  const expandedCategories = filterCategories.flatMap((c) => [c, c.toUpperCase(), c.toLowerCase()])

  const professionals = await prisma.business.findMany({
    where: { category: { in: expandedCategories } },
    orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
    take: 60,
  })

  // Category counts (unfiltered, for the pills)
  const allCategoryCounts = await prisma.business.groupBy({
    by: ["category"],
    where: {
      category: {
        in: PROFESSIONAL_CATEGORIES.flatMap((c) => [c, c.toUpperCase(), c.toLowerCase()]),
      },
    },
    _count: { _all: true },
  })

  const countsByCategory: Record<string, number> = {}
  allCategoryCounts.forEach((row) => {
    if (!row.category) return
    const normalized = PROFESSIONAL_CATEGORIES.find(
      (p) => p.toLowerCase() === row.category!.toLowerCase(),
    )
    if (normalized) {
      countsByCategory[normalized] = (countsByCategory[normalized] || 0) + row._count._all
    }
  })
  const totalCount = Object.values(countsByCategory).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <span className="text-rose-600 font-bold text-[10px] uppercase tracking-widest">
            Directory
          </span>
          <h1 className="mt-2 text-4xl md:text-5xl font-serif text-slate-900 tracking-tight">
            Wellness Professionals
          </h1>
          <p className="mt-4 text-slate-600 text-lg font-light max-w-2xl leading-relaxed">
            Discover verified wellness practitioners, spiritual guides, and healing professionals
            in Cusco and the Sacred Valley.
          </p>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            <Link
              href="/professionals"
              className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium shadow-sm transition-colors ${
                !activeCategory
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900"
              }`}
            >
              All
              <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                {totalCount}
              </span>
            </Link>

            {PROFESSIONAL_CATEGORIES.map((cat) => {
              const catData = getCategoryData(cat)
              const CatIcon = catData.icon
              const count = countsByCategory[cat] || 0
              const isActive = activeCategory === cat
              return (
                <Link
                  key={cat}
                  href={`/professionals?category=${cat.toLowerCase()}`}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium shadow-sm transition-colors ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <CatIcon className="w-4 h-4" />
                  {catData.label}
                  <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                    {count}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {professionals.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="text-xl font-serif text-slate-900 mb-2">No professionals found</h3>
            <p className="text-slate-500">Try a different category or check back soon.</p>
            <Link
              href="/professionals"
              className="mt-4 inline-block text-sm text-rose-600 font-medium hover:underline"
            >
              View all professionals
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">
              {professionals.length} professional{professionals.length !== 1 ? "s" : ""} found
              {activeCategory ? ` in ${getCategoryData(activeCategory).label}` : ""}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((professional) => (
                <DirectoryCard key={professional.id} business={professional} href={`/professionals/${professional.slug}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
