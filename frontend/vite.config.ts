import { defineConfig } from "vite";
import { resolve } from "node:path";

// Build straight into the integration so HACS ships the card with the
// integration; no separate plugin repository, no manual resources: entry.
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/proxon-schema-card.ts"),
      formats: ["es"],
      fileName: () => "proxon-schema-card.js",
    },
    outDir: resolve(__dirname, "../custom_components/proxon/www"),
    emptyOutDir: false,
    target: "es2021",
    minify: "esbuild",
    rollupOptions: {
      // lit is bundled on purpose: the card must not depend on what the
      // frontend happens to expose.
      output: { inlineDynamicImports: true },
    },
  },
});
