"use client";

import { useRouter } from "next/navigation";
import { Button, Logo } from "@/components/ui";

export default function LegalPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F4F5F7] to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-30 bg-white/80 backdrop-blur border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Logo width={40} height={40} />
            <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">
              Freelanzer
            </span>
          </div>
          <nav className="hidden md:flex gap-8 text-[#1A1A1A] font-medium">
            <button
              onClick={() => router.push("/")}
              className="hover:text-[#9ae600] transition"
            >
              Inicio
            </button>
            <button
              onClick={() => router.push("/")}
              className="hover:text-[#9ae600] transition"
            >
              Funciones
            </button>
            <button
              onClick={() => router.push("/")}
              className="hover:text-[#9ae600] transition"
            >
              Precios
            </button>
            <button
              onClick={() => router.push("/")}
              className="hover:text-[#9ae600] transition"
            >
              Contacto
            </button>
          </nav>
          <Button
            variant="outline"
            onClick={() => router.push("/login")}
            className="ml-4"
          >
            Iniciar sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-soft p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#0E0E2C] mb-8">
              Aviso Legal
            </h1>

            <div className="prose prose-lg max-w-none text-[#1A1A1A] space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  1. Información General
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Freelanzer es una plataforma SaaS desarrollada para
                  freelancers en Latinoamérica. Este aviso legal regula el uso
                  de la plataforma y establece los términos y condiciones que
                  rigen la relación entre los usuarios y Freelanzer.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  2. Propiedad Intelectual
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Todos los derechos de propiedad intelectual sobre la
                  plataforma Freelanzer, incluyendo pero no limitado a su
                  diseño, funcionalidades, código fuente y contenido, son
                  propiedad exclusiva de Freelanzer o sus licenciantes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  3. Uso de la Plataforma
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Los usuarios se comprometen a utilizar la plataforma de manera
                  responsable y conforme a la legislación aplicable. Queda
                  prohibido el uso de la plataforma para actividades ilegales o
                  que puedan dañar a terceros.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  4. Limitación de Responsabilidad
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Freelanzer no se hace responsable por los daños directos o
                  indirectos que puedan derivarse del uso de la plataforma,
                  incluyendo pérdida de datos, interrupciones del servicio o
                  errores en la información proporcionada.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  5. Modificaciones
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Freelanzer se reserva el derecho de modificar este aviso legal
                  en cualquier momento. Los cambios serán notificados a los
                  usuarios a través de la plataforma o por correo electrónico.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  6. Ley Aplicable
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Este aviso legal se rige por las leyes de México. Cualquier
                  disputa será resuelta en los tribunales competentes de la
                  Ciudad de México.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  7. Contacto
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Para cualquier consulta relacionada con este aviso legal,
                  puedes contactarnos a través de nuestro correo electrónico:
                  legal@freelanzer.com
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex items-center gap-2"
              >
                ← Volver al inicio
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo width={32} height={32} />
            <span className="font-bold text-[#1A1A1A]">Freelanzer</span>
          </div>
          <div className="flex gap-6 text-[#6B7280] text-sm">
            <button
              onClick={() => router.push("/legal")}
              className="hover:text-[#9ae600]"
            >
              Aviso legal
            </button>
            <button
              onClick={() => router.push("/privacy")}
              className="hover:text-[#9ae600]"
            >
              Privacidad
            </button>
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#9ae600]"
            >
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#9ae600]"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
