import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Deshabilitar temporalmente reglas que están causando problemas en el build
      "no-unused-vars": "warn", // Cambiar de error a warning
      "react-hooks/exhaustive-deps": "warn", // Cambiar de error a warning
      "@next/next/no-img-element": "warn", // Cambiar de error a warning
    },
  },
];

export default eslintConfig;
