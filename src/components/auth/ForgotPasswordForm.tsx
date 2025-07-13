"use client";

import React, { useState } from "react";
import Link from "next/link";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card from "../ui/Card";
import Logo from "../ui/Logo";
import { EmailIcon } from "../ui/icons";
import { useAuth } from "../../hooks/useAuth";

const ForgotPasswordForm: React.FC = () => {
  const { resetPassword, loading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);

    if (error) clearError();
    if (formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!email) {
      errors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "El correo electrónico no es válido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {}
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F5F7] to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl text-center">
            <div className="mb-6">
              <Logo className="mb-6" width={140} height={50} />
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#0E0E2C] mb-2">
                Correo enviado
              </h1>
              <p className="text-[#6B7280] mb-6">
                Hemos enviado un enlace de recuperación a tu correo electrónico.
              </p>
            </div>

            <Link href="/login">
              <Button variant="primary" className="w-full">
                Volver al login
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F7] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <div className="text-center mb-8">
            <Logo className="mb-6" width={140} height={50} />
            <h1 className="text-3xl font-bold text-[#0E0E2C] mb-2">
              Recuperar contraseña
            </h1>
            <p className="text-[#6B7280]">
              Ingresa tu correo electrónico para recibir un enlace de
              recuperación
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="tu@email.com"
              leftIcon={<EmailIcon />}
              error={formErrors.email}
              required
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              disabled={loading}
            >
              Enviar enlace de recuperación
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#6B7280]">
              ¿Recordaste tu contraseña?{" "}
              <Link
                href="/login"
                className="text-[#9ae600] hover:text-[#8ad600] font-medium transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
