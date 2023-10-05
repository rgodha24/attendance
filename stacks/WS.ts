import { StackContext, WebSocketApi, use } from "sst/constructs";
import { DBStack } from "./DB";
import { ApiStack } from "./API";

export function WSStack({ stack }: StackContext) {
  const { table } = use(DBStack);
  const { auth } = use(ApiStack);

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

  return { ws };
}
