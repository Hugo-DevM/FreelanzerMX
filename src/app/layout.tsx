import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "../styles/globals.css";
import ClientAuthProvider from "../components/providers/ClientAuthProvider";
import { AppProvider } from "../contexts/AppProvider";

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Freelanzer | Plataforma para freelancers en LATAM",
  description:
    "Genera cotizaciones, Contratos, Proyectos y lleva control de tus ingresos como freelancer.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${rubik.variable} font-rubik antialiased`}>
        <ClientAuthProvider>
          <AppProvider>{children}</AppProvider>
        </ClientAuthProvider>
      </body>
    </html>
  );
}
