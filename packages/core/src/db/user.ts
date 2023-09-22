import type { EntityRecord } from "electrodb";
import { UserEntity } from "./schema";
export * as User from "./user";

export type UserInner = EntityRecord<typeof UserEntity>;

export async function create(args: UserInner) {
  const res = await UserEntity.create(args).go();

  console.log("data", res.data);

  return res.data;
}

export async function getUID({ userID }: { userID: number }) {
  const res = await UserEntity.query.byUserID({ userID }).go();

  return res.data.length === 1 ? res.data[0] : null;
}

export async function getGoogleID({ googleID }: { googleID: string }) {
  const res = await UserEntity.query.byGoogleID({ googleID }).go();

  return res.data.length === 1 ? res.data[0] : null;
}

export async function addScanner({
  userID,
  scannerName,
}: {
  userID: number;
  scannerName: string;
}) {
  console.log("Adding scanner", scannerName, "to uid", userID);
  const res = await UserEntity.update({
    userID,
  })
    .add({
      connectedScanners: [scannerName],
    })
    .go();

  return res.data;
}

export async function removeScanner({
  userID,
  scannerName,
}: {
  userID: number;
  scannerName: string;
}) {
  console.log("removing scanner", scannerName, "from uid", userID);
  const res = await UserEntity.update({
    userID,
  })
    .delete({
      connectedScanners: [scannerName],
    })
    .go();

  return res.data;
}
