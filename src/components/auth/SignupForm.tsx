"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card from "../ui/Card";
import Logo from "../ui/Logo";
import GoogleButton from "../ui/GoogleButton";
import PasswordStrengthIndicator from "../ui/PasswordStrengthIndicator";
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
import { validatePassword } from "../../utils/passwordValidation";
import { checkDisplayNameExists, checkEmailExists } from "../../services/userService";

const SignupForm: React.FC = () => {
  const router = useRouter();
  const { signUp, signInWithGoogle, loading, error, clearError } = useAuth();

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
  const [passwordValidation, setPasswordValidation] = useState(() => validatePassword(""));
  const [displayNameExists, setDisplayNameExists] = useState(false);
  const [checkingDisplayName, setCheckingDisplayName] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validar contraseña en tiempo real
    if (name === "password") {
      setPasswordValidation(validatePassword(value));
    }

    // Resetear estado del nombre de usuario cuando cambia
    if (name === "displayName") {
      setDisplayNameExists(false);
    }

    // Resetear estado del email cuando cambia
    if (name === "email") {
      setEmailExists(false);
    }

    if (error) clearError();
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const checkDisplayNameAvailability = useCallback(
    async (displayName: string) => {
      try {
        setCheckingDisplayName(true);
        const exists = await checkDisplayNameExists(displayName);
        setDisplayNameExists(exists);
      } catch (error) {
        console.error("Error checking display name:", error);
      } finally {
        setCheckingDisplayName(false);
      }
    },
    []
  );

  const checkEmailAvailability = useCallback(
    async (email: string) => {
      try {
        setCheckingEmail(true);
        const exists = await checkEmailExists(email);
        setEmailExists(exists);
      } catch (error) {
        console.error("Error checking email:", error);
      } finally {
        setCheckingEmail(false);
      }
    },
    []
  );

  // Debounce para la verificación del nombre de usuario
  useEffect(() => {
    if (formData.displayName.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkDisplayNameAvailability(formData.displayName);
      }, 500); // Esperar 500ms después de que el usuario deje de escribir

      return () => clearTimeout(timeoutId);
    }
  }, [formData.displayName, checkDisplayNameAvailability]);

  // Debounce para la verificación del email
  useEffect(() => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (emailRegex.test(formData.email)) {
      const timeoutId = setTimeout(() => {
        checkEmailAvailability(formData.email);
      }, 500); // Esperar 500ms después de que el usuario deje de escribir

      return () => clearTimeout(timeoutId);
    }
  }, [formData.email, checkEmailAvailability]);

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
    } else if (formData.displayName.length < 3) {
      errors.displayName = "El nombre de usuario debe tener al menos 3 caracteres";
    } else if (displayNameExists) {
      errors.displayName = "Este nombre de usuario ya está en uso";
    }

    if (!formData.email) {
      errors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "El correo electrónico no es válido";
    } else if (emailExists) {
      errors.email = "Este correo electrónico ya está registrado";
    }

    if (!formData.password) {
      errors.password = "La contraseña es requerida";
    } else if (!passwordValidation.isValid) {
      errors.password = "La contraseña no cumple con los requisitos de seguridad";
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
      // El hook useAuth se encarga de redirigir a /verify-email
      // No necesitamos hacer router.push aquí
    } catch (error: any) {
      console.error("Signup form error:", error);
      // El error ya se maneja en el hook useAuth, no necesitamos hacer nada aquí
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F7] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
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

            <div className="space-y-2">
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
              
              {/* Indicador de disponibilidad del nombre de usuario */}
              {formData.displayName.length >= 3 && (
                <div className="flex items-center space-x-2">
                  {checkingDisplayName ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-[#9ae600] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-[#6B7280]">Verificando disponibilidad...</span>
                    </div>
                  ) : displayNameExists ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-red-600">Este nombre de usuario ya está en uso</span>
                    </div>
                  ) : formData.displayName.length >= 3 ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Nombre de usuario disponible</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="space-y-2">
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
              
              {/* Indicador de disponibilidad del email */}
              {/\S+@\S+\.\S+/.test(formData.email) && (
                <div className="flex items-center space-x-2">
                  {checkingEmail ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-[#9ae600] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-[#6B7280]">Verificando disponibilidad...</span>
                    </div>
                  ) : emailExists ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-red-600">Este correo electrónico ya está registrado</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Correo electrónico disponible</span>
                    </div>
                  )}
                </div>
              )}
            </div>

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

            <div className="space-y-2">
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
              
              {/* Indicador de fortaleza de contraseña */}
              {formData.password && (
                <PasswordStrengthIndicator 
                  validation={passwordValidation} 
                  showDetails={true}
                />
              )}
              
              {/* Lista de requisitos */}
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-medium">Requisitos de contraseña:</p>
                <ul className="space-y-1">
                  <li>• Mínimo 8 caracteres</li>
                  <li>• Al menos una letra mayúscula</li>
                  <li>• Al menos una letra minúscula</li>
                  <li>• Al menos un número</li>
                  <li>• Al menos un carácter especial (!@#$%^&*)</li>
                </ul>
              </div>
            </div>

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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O regístrate con</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleButton
                onClick={handleGoogleSignIn}
                loading={loading}
                disabled={loading}
              >
                Continuar con Google
              </GoogleButton>
            </div>
          </div>

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
