import { AstroSite, StackContext, StaticSite, use } from "sst/constructs";
import { ApiStack } from "./API";
import { WSStack } from "./WS";
import { DBStack } from "./DB";

export function SitesStack({ stack }: StackContext) {
  const { api } = use(ApiStack);
  const { ws } = use(WSStack);
  const { table } = use(DBStack);

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
          domainName: "batt.rgodha.com",
          hostedZone: "batt.rgodha.com",
          domainAlias: "fe.batt.rgodha.com",
        }
        : undefined,
  });

  const stats = new AstroSite(stack, "stats", {
    path: "packages/stats",
    environment: {
      VITE_API_URL: api.customDomainUrl || api.url,
    },
    bind: [table],
    customDomain:
      stack.stage === "production"
        ? {
          domainName: "stats.batt.rgodha.com",
          hostedZone: "batt.rgodha.com",
        }
        : undefined,
  });

  return { site, stats };
}
