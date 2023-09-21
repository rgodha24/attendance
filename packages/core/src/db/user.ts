import type { EntityRecord } from "electrodb";
import { UserEntity } from "./schema";
export * as User from "./user";

export type UserInner = EntityRecord<typeof UserEntity>;

export async function create(args: UserInner) {
  const res = await UserEntity.create(args).go();

  console.log("data", res.data);

  return res.data;
}

export async function get({ userID }: { userID: string }) {
  const res = await UserEntity.get({ userID }).go();

  return res.data;
}

export async function addScanner(userID: string, name: string) {
  console.log("Adding scanner", name, "to uid", userID);
  const res = await UserEntity.update({
    userID,
  })
    .add({
      connectedScanners: [name],
    })
    .go();

  return res.data;
}

export async function removeScanner(userID: string, scanner: string) {
  console.log("removing scanner", scanner, "from uid", userID);
  const res = await UserEntity.update({
    userID,
  })
    .delete({
      connectedScanners: [scanner],
    })
    .go();

  return res.data;
}
