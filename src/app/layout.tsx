import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontSerif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Cusco Bienestar",
    default: "Cusco Bienestar | Directorio de Eventos y Profesionales de Bienestar",
  },
  description: "Encuentra experiencias espirituales y de bienestar en Cusco, el Valle Sagrado y Machu Picchu.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Cusco Bienestar | Eventos y Profesionales de Bienestar",
    description: "Encuentra experiencias espirituales y de bienestar en Cusco, el Valle Sagrado y Machu Picchu.",
    siteName: "Cusco Bienestar",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cusco Bienestar | Eventos y Profesionales de Bienestar",
    description: "Encuentra experiencias espirituales y de bienestar en Cusco, el Valle Sagrado y Machu Picchu.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cusco Bienestar",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontSans.variable} ${fontSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <NuqsAdapter>
          <Navbar />
          <main className="flex-1 flex flex-col bg-background">
            {children}
          </main>
          <Footer />
        </NuqsAdapter>
      </body>
    </html>
  );
}
