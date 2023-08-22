import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@attendance/trpc";

export const trpc = createTRPCReact<AppRouter>();
