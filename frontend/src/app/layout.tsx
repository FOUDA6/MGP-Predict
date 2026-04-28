import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MGP-Predict — Prédiction de la Moyenne Générale",
  description:
    "Plateforme d'analyse et de prédiction de la Moyenne Générale Pondérée (MGP) basée sur les habitudes de vie des étudiants. Projet INF 232.",
  keywords: ["MGP", "prédiction", "analyse", "étudiants", "INF 232", "régression"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
            <p>
              MGP-Predict © 2026 — Projet INF 232 · Analyse de Données
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
