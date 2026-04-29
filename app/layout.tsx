import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyChauffeur | NCC di lusso in Italia",
  description:
    "Chauffeur service premium in Italia: transfer aeroportuali, disposizione oraria e viaggi business. Flotta Mercedes, autisti multilingua, prezzo fisso.",
  keywords: [
    "NCC lusso Italia",
    "chauffeur service",
    "transfer aeroportuali",
    "disposizione oraria",
    "noleggio con conducente",
    "MyChauffeur",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={cn(
        "dark h-full antialiased",
        inter.variable,
        montserrat.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
