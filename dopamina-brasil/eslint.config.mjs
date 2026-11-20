import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  { files: ["*.js", "scripts/*.js"], rules: { "@typescript-eslint/no-require-imports": "off" } }, // Existing Node CommonJS tools.
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "minified.js", // Generated bookmarklet; source is checked separately.
  ]),
]);

export default eslintConfig;
