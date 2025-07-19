"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { EmailIcon, CheckIcon } from "../../components/ui/icons";
import { supabase } from "../../lib/supabase";

const VerifyEmailPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Obtener el email de la URL o localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get("email");
    const storedEmail = localStorage.getItem("pendingVerificationEmail");

    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem("pendingVerificationEmail", emailParam);
    } else if (storedEmail) {
      setEmail(storedEmail);
    }

    // Iniciar countdown de 60 segundos
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResendEmail = async () => {
    if (!email || countdown > 0) return;

    setIsResending(true);
    setMessage("");
    try {
      // Llama a la función de Supabase para reenviar el correo de verificación
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setMessage("Error al reenviar el correo: " + error.message);
      } else {
        // Reiniciar countdown
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setMessage("Correo de verificación reenviado.");
      }
    } catch (error) {
      setMessage("Error inesperado al reenviar el correo.");
      console.error("Error resending email:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      router.push("/dashboard");
    } catch (error) {
      console.error("Error checking verification:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F5F7] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="p-8 shadow-none">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <EmailIcon className="w-8 h-8 text-blue-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Revisa tu bandeja de entrada
            </h2>

            <p className="text-gray-600 mb-6">
              Hemos enviado un enlace de verificación a:
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-gray-900 break-all">
                {email || "tu@email.com"}
              </p>
            </div>

            <div className="space-y-4 mb-2">
              <Button
                onClick={handleCheckVerification}
                className="w-full bg-[#9ae600] hover:bg-[#8ad600] text-white"
              >
                <CheckIcon className="w-5 h-5 mr-2" />
                Ya verifiqué mi correo
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">
                  ¿No recibiste el correo?
                </p>
                <button
                  onClick={handleResendEmail}
                  disabled={countdown > 0 || isResending}
                  className={`text-sm font-medium transition-colors ${
                    countdown > 0 || isResending
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  {isResending
                    ? "Enviando..."
                    : countdown > 0
                    ? `Reenviar en ${countdown}s`
                    : "Reenviar correo de verificación"}
                </button>
              </div>
              {message && (
                <p
                  className={`text-sm mt-2 ${
                    message.includes("Error")
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
