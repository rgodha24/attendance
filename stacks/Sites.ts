import { StackContext, StaticSite, use } from "sst/constructs";
import { ApiStack } from "./API";
import { WSStack } from "./WS";

export function SitesStack({ stack }: StackContext) {
  const { api } = use(ApiStack);
  const { ws } = use(WSStack);

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

  return { site };
}
