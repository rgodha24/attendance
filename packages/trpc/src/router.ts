import { classRouter } from "./routers/class";
import { router, publicProcedure, privateProcedure } from "./trpc";

export const appRouter = router({
  hello: publicProcedure.query(() => "hello world" as const),
  auth: privateProcedure.query(({ ctx }) => ctx.session.properties.userID),
  class: classRouter,
});

export type AppRouter = typeof appRouter;
