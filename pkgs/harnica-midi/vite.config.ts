/// <reference types="vitest" />

import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  define: {
    "import.meta.vitest": false,
  },
  build: {
    emptyOutDir: false,
    lib: {
      // 複数のエントリーポイントのディクショナリや配列にもできます
      entry: resolve(__dirname, "src/index.ts"),
      name: "HarnicaMidi",
      // 適切な拡張子が追加されます
      fileName: "index",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@test": resolve(__dirname, "test"),
    },
  },
  plugins: [
    dts({
      rollupTypes: false,
    }),
  ],
  test: {
    globals: true,
    dir: "src/",
    includeSource: ["**/*.spec.ts", "**/*.ts"],
  },
});
