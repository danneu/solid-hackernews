import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";

export default defineConfig({
  base: "/solid-hackernews/",
  plugins: [solid(), solidSvg()],
});
