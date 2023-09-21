import { classRouter } from "./routers/class";
import { router, publicProcedure, privateProcedure } from "./trpc";
import { signInRouter } from "./routers/signins";
import { scannerRouter } from "./routers/scanner";

export const appRouter = router({
  hello: publicProcedure.query(() => "hello world" as const),
  auth: privateProcedure.query(({ ctx }) => ctx.session.properties.userID),
  class: classRouter,
  signIn: signInRouter,
  scanner: scannerRouter,
});

export type AppRouter = typeof appRouter;
