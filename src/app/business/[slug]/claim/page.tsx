import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { ClaimForm } from "./claim-form"

interface ClaimPageProps {
  params: Promise<{ slug: string }>
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { slug } = await params

  const business = await prisma.business.findUnique({
    where: { slug: slug }
  })

  if (!business) return notFound()

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-slate-900 mb-2">Claim Your Business</h1>
          <p className="text-slate-500">
            Provide your contact info and Yape QR code to claim <strong>{business.name}</strong> for free.
          </p>
        </div>
        <ClaimForm businessId={business.id} slug={business.slug} />
      </div>
    </main>
  )
}
