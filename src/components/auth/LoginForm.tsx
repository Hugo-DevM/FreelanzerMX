"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card from "../ui/Card";
import Logo from "../ui/Logo";
import { EmailIcon, LockIcon, EyeIcon, EyeOffIcon } from "../ui/icons";
import { useAuth } from "../../hooks/useAuth";

const LoginForm: React.FC = () => {
  const router = useRouter();
  const { signIn, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error) clearError();
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.email) {
      errors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El correo electrónico no es válido";
    }

    if (!formData.password) {
      errors.password = "La contraseña es requerida";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await signIn(formData.email, formData.password);
      router.push("/dashboard");
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F7] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <div className="text-center mb-8">
            <Logo className="mb-6" width={140} height={50} />
            <h1 className="text-3xl font-bold text-[#0E0E2C] mb-2">
              Freelanzer
            </h1>
            <p className="text-[#6B7280]">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              leftIcon={<EmailIcon />}
              error={formErrors.email}
              required
            />

            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              leftIcon={<LockIcon />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#6B7280] hover:text-[#0E0E2C] transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
              error={formErrors.password}
              required
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-[#9ae600] hover:text-[#8ad600] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              disabled={loading}
            >
              Iniciar sesión
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#6B7280]">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/signup"
                className="text-[#9ae600] hover:text-[#8ad600] font-medium transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
