import { Config, StackContext, use } from "sst/constructs";
import { ApiStack } from "./API";
import { WSStack } from "./WS";
import { SitesStack } from "./Sites";

export function ConfigStack({ stack }: StackContext) {
  const { api } = use(ApiStack);
  const { ws } = use(WSStack);
  const { site, stats } = use(SitesStack);

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
    StatsUrl: stats.customDomainUrl || stats.url,
  });
}
