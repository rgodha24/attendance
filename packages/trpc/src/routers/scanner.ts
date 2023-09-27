import { TRPCError } from "@trpc/server";
import { privateProcedure, router } from "../trpc";
import { User } from "@attendance/core/db/user";

export const scannerRouter = router({
  connected: privateProcedure.query(async ({ ctx: { userID } }) => {
    const user = await User.getUID({ userID });
    if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
    return user.connectedScanners || [];
  }),
});
