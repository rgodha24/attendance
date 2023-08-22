import { ApiHandler } from "sst/node/api";
import { useSession } from "sst/node/auth";
import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";
import { appRouter } from "@attendance/trpc";

export const handler = ApiHandler(async (req, ctx) => {
  console.log(req.headers.Authorization);
  const session = useSession();

  console.log(session, req.headers.Authorization);

  return awsLambdaRequestHandler({
    router: appRouter,
    createContext: () => ({ session }),
  })(req, ctx);
});

export type Session = ReturnType<typeof useSession>;
