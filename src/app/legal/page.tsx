"use client";

import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import Logo from "../../components/ui/Logo";

export default function LegalPage() {
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
              Aviso Legal
            </h1>

            <div className="prose prose-lg max-w-none text-[#1A1A1A] space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  1. Aceptación de los Términos
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Al acceder y utilizar la plataforma Freelanzer, aceptas estar
                  sujeto a estos Términos de Servicio. Si no estás de acuerdo
                  con alguna parte de estos términos, no debes utilizar nuestro
                  servicio.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  2. Descripción del Servicio
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Freelanzer es una plataforma SaaS diseñada para freelancers en
                  Latinoamérica que ofrece herramientas para gestión de
                  proyectos, contratos, cotizaciones, seguimiento de pagos y
                  administración financiera.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  3. Registro y Cuenta de Usuario
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Para utilizar nuestros servicios, debes crear una cuenta
                  proporcionando información precisa y completa. Eres
                  responsable de mantener la confidencialidad de tu contraseña y
                  de todas las actividades que ocurran bajo tu cuenta.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  4. Uso Aceptable
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Te comprometes a utilizar la plataforma únicamente para fines
                  legales y de acuerdo con estos términos. Queda prohibido el
                  uso de la plataforma para actividades fraudulentas, spam, o
                  cualquier actividad que pueda dañar a otros usuarios.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  5. Propiedad Intelectual
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  La plataforma Freelanzer y todo su contenido, incluyendo pero
                  no limitado a software, diseño, texto, gráficos y
                  funcionalidades, son propiedad de Freelanzer y están
                  protegidos por leyes de propiedad intelectual.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  6. Privacidad y Datos
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Tu privacidad es importante para nosotros. El uso de tu
                  información personal está sujeto a nuestra Política de
                  Privacidad, que forma parte de estos términos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  7. Pagos y Facturación
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Los servicios premium requieren el pago de una tarifa. Todos
                  los pagos son no reembolsables, excepto donde la ley lo
                  requiera. Nos reservamos el derecho de modificar nuestros
                  precios con previo aviso.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  8. Disponibilidad del Servicio
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Nos esforzamos por mantener la plataforma disponible 24/7,
                  pero no garantizamos la disponibilidad ininterrumpida. Podemos
                  realizar mantenimiento programado con previo aviso.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  9. Limitación de Responsabilidad
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  En ningún caso Freelanzer será responsable por daños
                  indirectos, incidentales, especiales o consecuentes que
                  resulten del uso o la imposibilidad de usar nuestros
                  servicios.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  10. Terminación
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Podemos terminar o suspender tu cuenta en cualquier momento
                  por violación de estos términos. También puedes cancelar tu
                  cuenta en cualquier momento a través de la configuración de tu
                  perfil.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  11. Modificaciones
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en
                  cualquier momento. Los cambios serán notificados a través de
                  la plataforma o por correo electrónico.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  12. Ley Aplicable
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Estos términos se rigen por las leyes de México. Cualquier
                  disputa será resuelta en los tribunales competentes de la
                  Ciudad de México.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  13. Contacto
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Si tienes preguntas sobre estos términos, puedes contactarnos
                  en: legal@freelanzer.mx
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-[#0E0E2C] mb-4">
                  14. Fecha de Vigencia
                </h2>
                <p className="text-[#6B7280] leading-relaxed">
                  Estos términos entran en vigor el 1 de agosto de 2025 y
                  permanecen vigentes hasta que sean modificados o terminados.
                </p>
              </section>
            </div>
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
                onClick={() => router.push("/privacy")}
                className="hover:text-[#9ae600]"
              >
                Privacidad
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
