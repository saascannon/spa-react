import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.tsx"],
  outDir: "dist",
  format: ["cjs", "esm"],
  platform: "browser",
  sourcemap: false,
  clean: true,
  dts: true,
});
