import { EntityRecord } from "electrodb";
import { SignInEntity } from "./schema";
import { ulid } from "ulid";
import { signin } from "../analytics";

export * as SignIn from "./signin";

export type SignInInner = EntityRecord<typeof SignInEntity>;

export async function create(args: Omit<SignInInner, "time" | "signInID">) {
  const res = await SignInEntity.create({
    time: Date.now(),
    signInID: ulid(),
    ...args,
  }).go();

  await signin({ scannerName: args.scannerName, id: args.userID.toString() });

  return res.data;
}

export async function get(
  { userID, scannerName }: { userID: number; scannerName?: string },
  dates?: { start: Date; end?: Date }
) {
  const res = await SignInEntity.query
    .signins({ userID, scannerName })
    .between(
      {
        time: dates?.start.getTime() || 0,
      },
      { time: dates?.end?.getTime() || Date.now() }
    )
    .go();

  return res.data.map(({ time, ...s }) => ({ ...s, time: new Date(time) }));
}
