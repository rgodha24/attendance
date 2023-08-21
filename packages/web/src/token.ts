import { atomWithStorage } from "jotai/utils";

export const tokenAtom = atomWithStorage(
  "token",
  undefined as string | undefined
);
