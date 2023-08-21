import { StackContext, Api, StaticSite, Auth } from "sst/constructs";

export function API({ stack }: StackContext) {
  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/auth.handler",
    },
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        environment: {
          FRONTEND_URL:
            stack.stage === "prod"
              ? "https://d3srpthy1layee.cloudfront.net"
              : "http://localhost:5173",
        },
      },
    },
    routes: {},
  });

  auth.attach(stack, {
    api,
    prefix: "/auth",
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
