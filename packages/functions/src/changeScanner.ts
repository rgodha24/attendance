import { sendMessage } from "@attendance/core/message/send";
import { ApiHandler } from "sst/node/api";
import { z } from "zod";
import { User } from "@attendance/core/db/user";

export const handler = ApiHandler(async (req) => {
  const schema = z.object({
    oldUID: z.string().min(20).optional(),
    newUID: z.string().min(20).optional(),
    scannerName: z.string().min(2),
  });

  const data = schema.safeParse(req.queryStringParameters);
  if (!data.success) return { statusCode: 400, body: data.error.message };
  const { oldUID, newUID, scannerName } = data.data;

  // TODO: make sure the uids exist
  // TODO: add these to a queue? depending on how long it takes to send a message

  const promises: Promise<unknown>[] = [];
  if (oldUID !== newUID) {
    if (oldUID) {
      promises.push(
        sendMessage(oldUID, {
          type: "scannerDisconnected",
          scannerName,
        }).catch((err) =>
          console.error("unable to send message to old uid", oldUID, err)
        )
      );

      promises.push(
        User.removeScanner(oldUID, scannerName).catch((err) =>
          console.error(
            "unable to remove scanner",
            scannerName,
            "from uid",
            oldUID,
            err
          )
        )
      );
    }

    if (newUID) {
      promises.push(
        sendMessage(newUID, {
          type: "scannerConnected",
          scannerName,
        }).catch((err) =>
          console.error("unable to send message to new uid", newUID, err)
        )
      );

      promises.push(
        User.addScanner(newUID, scannerName).catch((err) =>
          console.error(
            "unable to add scanner",
            scannerName,
            "to uid",
            newUID,
            err
          )
        )
      );
    }
  }

  await Promise.all(promises);

  return { statusCode: 200, body: "OK" };
});
