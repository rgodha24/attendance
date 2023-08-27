import { StackContext, Api, StaticSite, Auth, Table } from "sst/constructs";

export function MyStack({ stack }: StackContext) {
  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/auth.handler",
    },
  });

  const table = new Table(stack, "electrodb", {
    fields: {
      pk: "string",
      sk: "string",
      gsi1pk: "string",
      gsi1sk: "string",
      // gsi2pk: "string",
      // gsi2sk: "string",
    },
    primaryIndex: {
      partitionKey: "pk",
      sortKey: "sk",
    },
    globalIndexes: {
      gsi1: {
        partitionKey: "gsi1pk",
        sortKey: "gsi1sk",
      },
    },
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        environment: {
          FRONTEND_URL:
            stack.stage === "prod"
              ? "fe.batt.rgodha.com"
              : "http://localhost:5173",
        },
        bind: [table],
      },
    },
    routes: {
      "GET /trpc/{proxy+}": "packages/functions/src/trpc.handler",
      "POST /trpc/{proxy+}": "packages/functions/src/trpc.handler",
    },
    customDomain:
      stack.stage === "prod"
        ? { domainName: "api.batt.rgodha.com", hostedZone: "batt.rgodha.com" }
        : undefined,
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
    customDomain:
      stack.stage === "prod"
        ? { domainName: "fe.batt.rgodha.com", hostedZone: "batt.rgodha.com" }
        : undefined,
  });

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl || api.url,
    SiteUrl: site.customDomainUrl || site.url,
  });
}
