import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

export const tokenAtom = atomWithStorage(
  "token",
  undefined as string | undefined
);

export const uidAtom = atom((get) => {
  const token = get(tokenAtom);
  if (!token) return undefined;
  try {
    const [, payload] = token.split(".");
    const {
      properties: { userID },
    } = JSON.parse(atob(payload));

    return (userID as number) || null;
  } catch (e) {
    return null;
  }
});
