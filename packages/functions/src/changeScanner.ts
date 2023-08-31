import { sendMessage } from "@attendance/core/message/send";
import { ApiHandler } from "sst/node/api";
import { z } from "zod";

export const handler = ApiHandler(async (req) => {
  const schema = z.object({
    oldUID: z.string().min(20).optional(),
    newUID: z.string().min(20),
    scannerName: z.string().min(2),
  });

  const data = schema.safeParse(req.queryStringParameters);
  if (!data.success) return { statusCode: 400, body: data.error.message };
  const { oldUID, newUID, scannerName } = data.data;

  // TODO: make sure the uids exist
  // TODO: add these to a queue? depending on how long it takes to send a message

  if (oldUID !== newUID) {
    if (oldUID)
      await sendMessage(oldUID, {
        type: "scannerDisconnected",
        scannerName,
      });

    await sendMessage(newUID, {
      type: "scannerConnected",
      scannerName,
    });
  }

  return { statusCode: 200, body: "OK" };
});
