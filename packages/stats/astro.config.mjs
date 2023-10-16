import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import aws from "astro-sst/lambda";

export default defineConfig({
  integrations: [tailwind()],
  mode: "server",
  adapter: aws(),
});
