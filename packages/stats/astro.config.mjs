import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import aws from "astro-sst/lambda";

export default defineConfig({
  integrations: [tailwind()],
  output: "server",
  adapter: aws(),
});
