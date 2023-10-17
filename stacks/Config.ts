import { Config, StackContext, use } from "sst/constructs";
import { ApiStack } from "./API";
import { WSStack } from "./WS";
import { SitesStack } from "./Sites";

export function ConfigStack({ stack }: StackContext) {
  const { api } = use(ApiStack);
  const { ws } = use(WSStack);
  const { site } = use(SitesStack);

  const wsURL = new Config.Parameter(stack, "wsURL", {
    value: ws.customDomainUrl || ws.url,
  });

  const frontendURL = new Config.Parameter(stack, "frontendURL", {
    value:
      stack.stage === "production"
        ? "https://batt.rgodha.com"
        : "http://localhost:5173",
  });

  api.bind([wsURL, frontendURL, ws]);
  ws.bind([wsURL]);

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl || api.url,
    SiteUrl: site.customDomainUrl || site.url,
    WsUrl: ws.customDomainUrl || ws.url,
  });
}
