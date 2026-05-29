"use client"

import Link from "next/link"
import { MapPin, Star, Zap } from "lucide-react"
import { SafeImageWrapper } from "@/components/ui/safe-image"
import { getCategoryData } from "@/features/discovery/constants"
import { cn } from "@/lib/utils"
import type { Business } from "@prisma/client"

interface DirectoryCardProps {
  business: Business
  href?: string
}

export function DirectoryCard({ business, href }: DirectoryCardProps) {
  const catData = getCategoryData(business.category)
  const CatIcon = catData.icon
  const displayImage = business.imageUrl || catData.fallbackImage

  return (
    <Link
      href={href ?? `/business/${business.slug}`}
      className="group block bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <SafeImageWrapper
          src={displayImage}
          fallbackSrc={catData.fallbackImage}
          alt={business.name}
          imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          wrapperClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {business.isClaimed && (
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 text-slate-900 px-2 py-1 rounded-md text-[10px] font-bold shadow-sm backdrop-blur-md flex items-center gap-1">
              <Zap className="w-3 h-3 fill-rose-600 text-rose-600" />
              Verified
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-900 text-[15px] leading-tight line-clamp-1 group-hover:text-rose-600 transition-colors">
            {business.name}
          </h3>
          {business.rating != null && (
            <div className="flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="font-bold text-[11px] text-slate-800">{business.rating}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border flex items-center gap-1",
              catData.theme,
            )}
          >
            <CatIcon className="w-2.5 h-2.5" />
            {catData.label}
          </span>

          {business.locationSlug && (
            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />
              {business.locationSlug
                .split("-")
                .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
            </span>
          )}
        </div>

        {business.description && (
          <p className="text-slate-500 text-xs italic leading-relaxed line-clamp-2">
            &ldquo;{business.description}&rdquo;
          </p>
        )}
      </div>
    </Link>
  )
}
