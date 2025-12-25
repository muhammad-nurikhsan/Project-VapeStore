import type { Metadata } from "next";
import "./globals.css";
import AgeGate from "@/components/age-gate";

export const metadata: Metadata = {
  title: "Vapestore - Katalog Digital",
  description: "Katalog produk vape terlengkap dengan sistem multi-cabang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <AgeGate />
        {children}
      </body>
    </html>
  );
}
