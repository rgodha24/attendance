import { StackContext, Api, StaticSite } from "sst/constructs";

export function API({ stack }: StackContext) {
  const api = new Api(stack, "api", {
    defaults: {
      function: {},
    },
    routes: {},
  });

  const site = new StaticSite(stack, "site", {
    path: "packages/web",
    buildOutput: "dist",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.url,
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    SiteUrl: site.url,
  });
}
