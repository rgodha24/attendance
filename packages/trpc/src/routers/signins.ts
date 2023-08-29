import { z } from "zod";
import { privateProcedure, router } from "../trpc";
import { SignIn } from "@attendance/core/db/signin";

export const signInRouter = router({
  get: privateProcedure
    .input(
      z
        .object({
          scannerName: z.string().min(2).optional(),
          start: z.coerce.date(),
          end: z.coerce.date().optional(),
        })
        .or(z.object({ scannerName: z.string().min(2).optional() }))
    )
    .query(async ({ ctx, input }) => {
      const { scannerName } = input;

      const res = await SignIn.get(
        { userID: ctx.userID, scannerName },
        "start" in input ? { start: input.start, end: input.end } : undefined
      );

      return res;
    }),
});
