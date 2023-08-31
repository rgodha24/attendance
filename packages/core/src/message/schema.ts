import { z } from "zod";

export const messageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("signin"),
    studentID: z.coerce.number(),
    time: z.coerce.date(),
    scannerName: z.string(),
    id: z.string(),
  }),
  z.object({
    type: z.literal("scannerConnected"),
    scannerName: z.string(),
  }),
  z.object({
    type: z.literal("scannerDisconnected"),
    scannerName: z.string(),
  }),
]);

export type Message = z.infer<typeof messageSchema>;
