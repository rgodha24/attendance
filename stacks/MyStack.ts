import {
  StackContext,
  Api,
  StaticSite,
  Auth,
  Table,
  WebSocketApi,
  Config,
} from "sst/constructs";

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
        bind: [table],
      },
    },
    routes: {
      "GET /trpc/{proxy+}": "packages/functions/src/trpc.handler",
      "POST /trpc/{proxy+}": "packages/functions/src/trpc.handler",
      "POST /signin": "packages/functions/src/signin.handler",
      "POST /changeScanner": "packages/functions/src/changeScanner.handler",
    },
    customDomain:
      stack.stage === "production"
        ? { domainName: "api.batt.rgodha.com", hostedZone: "batt.rgodha.com" }
        : undefined,
  });

  auth.attach(stack, {
    api,
    prefix: "/auth",
  });

  const ws = new WebSocketApi(stack, "ws", {
    routes: {
      $connect: "packages/functions/src/ws.connect",
      $disconnect: "packages/functions/src/ws.disconnect",
      auth: "packages/functions/src/ws.auth",
    },
    customDomain:
      stack.stage === "production"
        ? {
          domainName: "ws.batt.rgodha.com",
          hostedZone: "batt.rgodha.com",
        }
        : undefined,
    defaults: {
      function: {
        bind: [table, auth],
      },
    },
  });

  const site = new StaticSite(stack, "site", {
    path: "packages/web",
    buildOutput: "dist",
    buildCommand: "pnpm build",
    environment: {
      VITE_API_URL: api.customDomainUrl || api.url,
      VITE_WS_URL: ws.customDomainUrl || ws.url,
    },
    customDomain:
      stack.stage === "production"
        ? {
          domainName: "fe.batt.rgodha.com",
          domainAlias: "batt.rgodha.com",
          hostedZone: "batt.rgodha.com",
        }
        : undefined,
  });

  const wsURL = new Config.Parameter(stack, "wsURL", {
    value: ws.customDomainUrl || ws.url,
  });

  const frontendURL = new Config.Parameter(stack, "frontendURL", {
    value: site.customDomainUrl || site.url || "http://localhost:5173",
  });

  const apiURL = new Config.Parameter(stack, "apiURL", {
    value: api.customDomainUrl || api.url,
  });

  api.bind([wsURL, frontendURL, ws, apiURL]);
  ws.bind([wsURL]);

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl || api.url,
    SiteUrl: site.customDomainUrl || site.url,
    WsUrl: ws.customDomainUrl || ws.url,
  });
}
