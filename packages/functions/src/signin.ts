import { SignIn } from "@attendance/core/db/signin";
import { ApiHandler } from "sst/node/api";
import { z } from "zod";
import { sendMessage } from "@attendance/core/message/send";

export const handler = ApiHandler(async (req) => {
  const schema = z.object({
    studentID: z.coerce.number().min(10_000).max(99_999),
    scannerName: z.coerce.string(),
    userID: z.coerce
      .number()
      .min(1 * 10 ** 14)
      .max(1 * 10 ** 15),
  });

  const res = schema.safeParse(req.queryStringParameters);
  if (!res.success) {
    return { statusCode: 400, body: res.error.message };
  }

  const signin = await SignIn.create(res.data);
  console.table(signin);

  await sendMessage(signin.userID, {
    type: "signin",
    time: new Date(signin.time),
    studentID: signin.studentID,
    scannerName: signin.scannerName,
    id: signin.signInID,
  });

  return { statusCode: 200, body: "OK" };
});
