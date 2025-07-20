"use client";

import { useRouter } from "next/navigation";
import { Button, Logo } from "@/components/ui";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F4F5F7] to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-30 bg-white/80 backdrop-blur border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between h-20 px-4 sm:px-8">
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
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:text-[#9ae600] transition"
            >
              Funciones
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("pricing")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:text-[#9ae600] transition"
            >
              Precios
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="hover:text-[#9ae600] transition"
            >
              Contacto
            </button>
          </nav>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Iniciar sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-soft p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#0E0E2C] mb-8">
              Política de Privacidad
            </h1>

            <div className="prose prose-lg max-w-none text-[#1A1A1A] space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  1. Información que Recopilamos
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Recopilamos información que nos proporcionas directamente,
                  como cuando creas una cuenta, completas tu perfil, o nos
                  contactas. Esta información puede incluir tu nombre, correo
                  electrónico, información de contacto y datos de facturación.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  2. Uso de la Información
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Utilizamos la información recopilada para proporcionar,
                  mantener y mejorar nuestros servicios, procesar transacciones,
                  enviar comunicaciones relacionadas con el servicio y
                  personalizar tu experiencia en la plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  3. Compartir Información
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  No vendemos, alquilamos ni compartimos tu información personal
                  con terceros, excepto en las circunstancias limitadas
                  descritas en esta política o cuando tengamos tu consentimiento
                  explícito.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  4. Seguridad de Datos
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizativas
                  apropiadas para proteger tu información personal contra acceso
                  no autorizado, alteración, divulgación o destrucción.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  5. Cookies y Tecnologías Similares
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Utilizamos cookies y tecnologías similares para mejorar tu
                  experiencia, analizar el uso de la plataforma y personalizar
                  el contenido. Puedes controlar el uso de cookies a través de
                  la configuración de tu navegador.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  6. Tus Derechos
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Tienes derecho a acceder, corregir, actualizar o eliminar tu
                  información personal. También puedes solicitar una copia de
                  tus datos o retirar tu consentimiento en cualquier momento.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  7. Retención de Datos
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Conservamos tu información personal durante el tiempo
                  necesario para cumplir con los propósitos descritos en esta
                  política, a menos que la ley requiera un período de retención
                  más largo.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  8. Cambios en esta Política
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Podemos actualizar esta política de privacidad ocasionalmente.
                  Te notificaremos sobre cualquier cambio significativo por
                  correo electrónico o a través de la plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  9. Contacto
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Si tienes preguntas sobre esta política de privacidad o sobre
                  cómo manejamos tu información personal, contáctanos en:
                  privacy@freelanzer.com
                </p>
              </section>
            </div>

            <div className="mt-12 pt-8 border-t border-[#E5E7EB]"></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-white border-t border-[#E5E7EB] py-8 px-4 sm:px-8 mt-auto"
      >
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Logo - pegado al borde izquierdo */}
          <div className="flex items-center gap-2">
            <Logo width={32} height={32} />
            <span className="font-bold text-[#1A1A1A]">Freelanzer</span>
          </div>

          {/* Enlaces centrados */}
          <div className="flex-1 flex justify-center">
            <div className="flex gap-6 text-[#6B7280] text-sm">
              <button
                onClick={() => router.push("/legal")}
                className="hover:text-[#9ae600]"
              >
                Aviso legal
              </button>
              <a
                href="https://www.instagram.com/freelanzermx?igsh=djR6aWVyaWxiN3Rl&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#9ae600]"
              >
                Instagram
              </a>
            </div>
          </div>

          {/* Espacio vacío para mantener el balance */}
          <div className="hidden md:block w-[120px]"></div>
        </div>
      </footer>
    </div>
  );
}
