"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card from "../ui/Card";
import Logo from "../ui/Logo";
import {
  EmailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  PhoneIcon,
  BuildingIcon,
} from "../ui/icons";
import { useAuth } from "../../hooks/useAuth";

const SignupForm: React.FC = () => {
  const router = useRouter();
  const { signUp, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    displayName: "",
    phone: "",
    company: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!formData.firstName) {
      errors.firstName = "El nombre es requerido";
    }

    if (!formData.lastName) {
      errors.lastName = "El apellido es requerido";
    }

    if (!formData.displayName) {
      errors.displayName = "El nombre de usuario es requerido";
    }

    if (!formData.email) {
      errors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El correo electrónico no es válido";
    }

    if (!formData.password) {
      errors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Signup form error:", error);
      // El error ya se maneja en el hook useAuth, no necesitamos hacer nada aquí
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F7] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <div className="text-center mb-8">
            <Logo className="mb-6" width={140} height={50} />
            <h1 className="text-3xl font-bold text-[#0E0E2C] mb-2">
              Crear cuenta
            </h1>
            <p className="text-[#6B7280]">Únete a nuestra plataforma</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Tu nombre"
                leftIcon={<UserIcon />}
                error={formErrors.firstName}
                required
              />

              <Input
                label="Apellido"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Tu apellido"
                leftIcon={<UserIcon />}
                error={formErrors.lastName}
                required
              />
            </div>

            <Input
              label="Nombre de usuario"
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="nombre_usuario"
              leftIcon={<UserIcon />}
              error={formErrors.displayName}
              helperText="Este será tu nombre público"
              required
            />

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

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Teléfono (opcional)"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+52 55 1234 5678"
                leftIcon={<PhoneIcon />}
              />

              <Input
                label="Empresa (opcional)"
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Tu empresa"
                leftIcon={<BuildingIcon />}
              />
            </div>

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
              helperText="Mínimo 6 caracteres"
              required
            />

            <Input
              label="Confirmar contraseña"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              leftIcon={<LockIcon />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[#6B7280] hover:text-[#0E0E2C] transition-colors"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
              error={formErrors.confirmPassword}
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
              Crear cuenta
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#6B7280]">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="text-[#9ae600] hover:text-[#8ad600] font-medium transition-colors"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-[#F4F5F7] rounded-lg">
            <p className="text-xs text-[#6B7280] text-center">
              Al crear una cuenta, aceptas nuestros{" "}
              <Link href="/terms" className="text-[#9ae600] hover:underline">
                Términos de Servicio
              </Link>{" "}
              y{" "}
              <Link href="/privacy" className="text-[#9ae600] hover:underline">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignupForm;
