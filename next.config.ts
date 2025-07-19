import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Activar React.StrictMode solo en producción para mejorar rendimiento en desarrollo
  reactStrictMode: process.env.NODE_ENV === "production",

  // Optimizaciones adicionales
  compress: true,

  // Configuración de imágenes optimizada
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Optimizaciones de compilación (removido optimizeCss que causa problemas)
  experimental: {
    // optimizeCss: true, // Comentado para evitar problemas con critters
  },
};

export default nextConfig;
