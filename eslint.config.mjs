// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extiende las reglas básicas de Next.js
  ...compat.extends("next/core-web-vitals"),

  {
    files: ["**/*.ts", "**/*.tsx"],

    languageOptions: {
      parser: await import("@typescript-eslint/parser"),
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    plugins: {
      ts: await import("@typescript-eslint/eslint-plugin"),
    },

    rules: {
      "no-unused-vars": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",

      "ts/no-unused-vars": "warn",
      // "ts/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
