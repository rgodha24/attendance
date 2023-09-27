import { atomWithStorage } from "jotai/utils";
import type { Class } from "../routes/home";

export const selectedClassAtom = atomWithStorage<Class | undefined>(
  "selected-class",
  undefined
);

export const scannerNameAtom = atomWithStorage<string | undefined>(
  "scannerName",
  undefined
);

export const deduplicateAtom = atomWithStorage("deduplicate", true);
