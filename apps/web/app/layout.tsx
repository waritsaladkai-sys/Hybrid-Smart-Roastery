import type { Metadata } from "next";
import "./globals.css";
import "./components.css";

export const metadata: Metadata = {
  title: "Eight Coffee Roasters",
  description: "Hybrid Smart Roastery — Web ERP + E-Commerce",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children as any;
}
