import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@attendance/trpc/router";

export const trpc = createTRPCReact<AppRouter>();
