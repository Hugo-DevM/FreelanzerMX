import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "../styles/globals.css";
import ClientAuthProvider from "../components/providers/ClientAuthProvider";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Freelanzer | Plataforma para freelancers en LATAM",
  description:
    "Genera cotizaciones, facturas y lleva control de tus ingresos como freelancer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${rubik.variable} font-rubik antialiased`}>
        <ClientAuthProvider>{children}</ClientAuthProvider>
      </body>
    </html>
  );
}
