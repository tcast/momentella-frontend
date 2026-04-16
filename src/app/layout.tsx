import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Momentella — Boutique travel for families",
    template: "%s — Momentella",
  },
  description:
    "Thoughtfully designed journeys for families who want the world—without the overwhelm. Higher-end travel planning with kids in mind.",
  openGraph: {
    title: "Momentella — Boutique travel for families",
    description:
      "Thoughtfully designed journeys for families who want the world—without the overwhelm.",
    siteName: "Momentella",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="grain relative isolate min-h-full">
        <div className="relative z-10 flex min-h-full flex-col">{children}</div>
      </body>
    </html>
  );
}
