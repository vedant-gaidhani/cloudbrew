import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import CartDrawer from "@/components/CartDrawer";
import TransitionOverlay from "@/components/TransitionOverlay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: "Cloudbrew | The Creamy Dream Café",
  description: "Experience high-fashion aesthetics blended with the comfort of a creamy dream. Artisanal coffee, ethereal foam, and gravity-defying flavor.",
  openGraph: {
    type: "website",
    title: "Cloudbrew | The Creamy Dream Café",
    description: "Experience high-fashion aesthetics blended with the comfort of a creamy dream.",
    images: ["/assets/images/hero-depth.webp"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorant.variable} font-sans antialiased bg-cb-cream text-cb-espresso overflow-x-hidden`}
        suppressHydrationWarning
      >
        <Suspense fallback={null}>
          {/* Placeholder for Vercel Analytics / Posthog */}
        </Suspense>
        <TransitionOverlay />
        <CustomCursor />
        <div className="film-grain"></div>
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
