import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params;
  const isEs = lang === 'es';
  
  return {
    title: isEs ? 'Explorar el Cusco, Valle Sagrado y Machu Picchu | CUSCO BIENESTAR' : 'Explore Cusco, the Sacred Valley & Machu Picchu | CUSCO BIENESTAR',
    description: isEs
      ? 'Descubre restaurantes, hoteles, spas y aventuras en Cusco, el Valle Sagrado y Machu Picchu.'
      : 'Discover restaurants, hotels, spas, and adventures in Cusco, the Sacred Valley and Machu Picchu.',
    alternates: {
      canonical: `${siteConfig.url}/${lang}/explore`,
      languages: {
        en: `${siteConfig.url}/en/explore`,
        es: `${siteConfig.url}/es/explore`,
        'x-default': `${siteConfig.url}/en/explore`,
      }
    },
    openGraph: {
      title: isEs ? 'Explorar el Cusco, Valle Sagrado y Machu Picchu — CUSCO BIENESTAR' : 'Explore Cusco, the Sacred Valley & Machu Picchu — CUSCO BIENESTAR',
      description: isEs
        ? 'Encuentra y reserva experiencias locales verificadas para explorar el Cusco, Valle Sagrado y Machu Picchu.'
        : 'Find and book verified local experiences to explore Cusco, the Sacred Valley and Machu Picchu.',
      url: `${siteConfig.url}/${lang}/explore`,
      images: [{ url: '/images/og-default.jpg', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isEs ? 'Explorar el Cusco, Valle Sagrado y Machu Picchu — CUSCO BIENESTAR' : 'Explore Cusco, the Sacred Valley & Machu Picchu — CUSCO BIENESTAR',
      description: isEs
        ? 'Descubrimiento de restaurantes, hoteles y aventuras en Cusco, Valle Sagrado y Machu Picchu.'
        : 'Discovery of restaurants, hotels, and adventures in Cusco, Sacred Valley & Machu Picchu.',
      images: ['/images/og-default.jpg'],
    },
  };
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Explore the Sacred Valley | CUSCO BIENESTAR",
    "description": "Discover restaurants, hotels, spas, and adventures in Cusco, Urubamba, Pisac, Ollantaytambo and Machu Picchu.",
    "url": `${siteConfig.url}/explore`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
