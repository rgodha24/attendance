import { TRPCError, initTRPC } from "@trpc/server";
import { SessionValue } from "sst/node/auth";
import superjson from "superjson";

declare module "sst/node/auth" {
  export interface SessionTypes {
    user: {
      userID: number;
      googleID: string;
    };
  }
}

type Context = {
  session: SessionValue;
};

const t = initTRPC.context<Context>().create({ transformer: superjson });

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
      googleID: ctx.session.properties.googleID,
    },
  });
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(ensureAuthedMiddleware);
