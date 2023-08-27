import { ApiHandler } from "sst/node/api";
import { useSession } from "sst/node/auth";
import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { appRouter } from "@attendance/trpc/router";

export const handler = ApiHandler(async (req, ctx) => {
  const session = useSession();

  return awsLambdaRequestHandler({
    router: appRouter,
    createContext: () => ({ session }),
  })(req, ctx);
});

export type Session = ReturnType<typeof useSession>;
