import { StackContext, Auth, Api, use } from "sst/constructs";
import { DBStack } from "./DB";

export function ApiStack({ stack }: StackContext) {
  const { table } = use(DBStack);

  const auth = new Auth(stack, "auth", {
    authenticator: {
      handler: "packages/functions/src/auth.handler",
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
      "POST /scannerPing": "packages/functions/src/scannerPing.handler",
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

  return { auth, api };
}
