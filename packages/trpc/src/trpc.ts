import { TRPCError, initTRPC } from "@trpc/server";
import { SessionValue } from "sst/node/auth";

declare module "sst/node/auth" {
  export interface SessionTypes {
    user: {
      userID: string;
    };
  }
}

type Context = {
  session: SessionValue;
};

const t = initTRPC.context<Context>().create();

const ensureAuthedMiddleware = t.middleware(({ ctx, next }) => {
  if (ctx.session.type === "public") {
    console.log(ctx.session);
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userID: ctx.session.properties.userID,
    },
  });
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(ensureAuthedMiddleware);
