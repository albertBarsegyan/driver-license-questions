import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["build/**", ".react-router/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        console: "readonly",
        document: "readonly",
        localStorage: "readonly",
        navigator: "readonly",
        process: "readonly",
        window: "readonly",
      },
    },
    rules: {
      "no-empty-pattern": "off",
    },
  },
  prettier,
);
