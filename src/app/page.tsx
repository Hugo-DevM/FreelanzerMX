"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../contexts/AuthContext";
import {
  Button,
  Card,
  Logo,
  ArrowRightIcon,
  ContractIcon,
  PaymentIcon,
  ProjectIcon,
  UserIcon,
} from "../components/ui";

const features = [
  {
    icon: <ContractIcon />,
    title: "Contratos y cotizaciones rápidas",
    description:
      "Genera contratos y cotizaciones profesionales en minutos, listos para compartir con tus clientes.",
  },
  {
    icon: <PaymentIcon />,
    title: "Seguimiento de pagos",
    description:
      "Lleva el control de tus ingresos y pagos pendientes de forma sencilla y visual.",
  },
  {
    icon: <ProjectIcon />,
    title: "Gestión de proyectos",
    description:
      "Organiza y monitorea todos tus proyectos freelance desde un solo lugar.",
  },
];

const testimonials = [
  {
    name: "Ana Torres",
    role: "Diseñadora Freelance",
    text: "Freelanzer me ayudó a profesionalizar mi trabajo y ahorrar horas en papeleo. ¡Ahora todo es más fácil!",
  },
  {
    name: "Carlos Méndez",
    role: "Desarrollador Web",
    text: "La gestión de pagos y contratos es súper intuitiva. Recomiendo Freelanzer a cualquier freelancer en LATAM.",
  },
];

const plans = [
  {
    name: "Gratis",
    price: "$0",
    features: [
      "Gestión de 3 proyectos",
      "Contratos y cotizaciones ilimitadas",
      "Seguimiento de pagos básico",
    ],
    cta: "Comenzar gratis",
    highlight: false,
    available: true,
  },
  {
    name: "Premium",
    price: "$7/mes",
    features: [
      "Proyectos ilimitados",
      "Seguimiento avanzado de ingresos",
      "Soporte prioritario",
      "Personalización de contratos",
    ],
    cta: "Próximamente",
    highlight: true,
    available: false,
  },
  {
    name: "Equipos",
    price: "$22/mes",
    features: [
      "Todo lo de Premium",
      "Hasta 5 usuarios por cuenta",
      "Colaboración en proyectos",
      "Panel de administración de equipo",
      "Soporte premium",
      "Integraciones externas",
    ],
    cta: "Próximamente",
    highlight: false,
    available: false,
  },
];

export default function Page() {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F5F7] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9ae600] mx-auto mb-4"></div>
          <p className="text-[#6B7280]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user) return null;

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
          <Button
            variant="outline"
            onClick={() => router.push("/login")}
            className="ml-4"
          >
            Iniciar sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center flex-1 pt-32 pb-16 px-4 text-center bg-gradient-to-br from-[#F4F5F7] to-white">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#0E0E2C] mb-6 leading-tight">
          Tu plataforma todo-en-uno para freelancers en LATAM
        </h1>
        <p className="text-lg md:text-xl text-[#6B7280] mb-8 max-w-2xl mx-auto">
          Contratos, pagos, cotizaciones y gestión de proyectos, todo desde un
          solo lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => router.push("/register")}
            className="text-lg px-8 py-4 flex items-center gap-2"
          >
            Comienza gratis <ArrowRightIcon />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8"
      >
        {features.map((feature, idx) => (
          <Card
            key={idx}
            className="flex flex-col items-center text-center gap-4 p-8 h-full"
          >
            <div className="bg-[#F4F5F7] rounded-full p-4 mb-2 flex items-center justify-center">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              {feature.title}
            </h3>
            <p className="text-[#6B7280]">{feature.description}</p>
          </Card>
        ))}
      </section>

      {/* Testimonios/Beneficios */}
      <section className="bg-[#F9FAFB] py-16 px-4">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-[#0E0E2C] mb-4">
            ¿Por qué Freelanzer?
          </h2>
          <p className="text-[#6B7280] max-w-2xl mx-auto">
            Aumenta tu productividad, profesionaliza tu trabajo y haz crecer tu
            negocio freelance con herramientas pensadas para LATAM.
          </p>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="flex flex-col gap-4 p-8">
              <div className="flex items-center gap-3">
                <UserIcon size={28} className="text-[#9ae600]" />
                <div>
                  <div className="font-semibold text-[#1A1A1A]">{t.name}</div>
                  <div className="text-sm text-[#6B7280]">{t.role}</div>
                </div>
              </div>
              <p className="text-[#1A1A1A] italic">“{t.text}”</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-[#0E0E2C] text-center mb-10">
          Precios
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <Card
              key={idx}
              className={`flex flex-col items-center text-center gap-6 p-8 border-2 ${
                plan.highlight ? "border-[#9ae600]" : "border-transparent"
              }`}
            >
              <h3 className="text-2xl font-bold text-[#1A1A1A]">{plan.name}</h3>
              <div className="text-4xl font-extrabold text-[#9ae600]">
                {plan.price}
              </div>
              <ul className="text-[#6B7280] space-y-2 mb-4 flex-1 items-start w-full flex flex-col">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 justify-start w-full text-left break-words"
                  >
                    <span className="w-2 h-2 bg-[#9ae600] rounded-full inline-block flex-shrink-0"></span>{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                size="md"
                variant={plan.highlight ? "primary" : "outline"}
                onClick={() => plan.available && router.push("/signup")}
                disabled={!plan.available}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-white border-t border-[#E5E7EB] py-8 px-4 mt-auto"
      >
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
              href="https://www.instagram.com/freelanzermx?igsh=djR6aWVyaWxiN3Rl&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#9ae600]"
            >
              Instagram
            </a>
            {/* <a
              href="https://www.twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#9ae600]"
            >
              Twitter
            </a> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
