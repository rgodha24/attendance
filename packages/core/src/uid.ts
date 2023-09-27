import { randomBytes } from "crypto";

export function createUID(): number {
  let num =
    parseInt(randomBytes(8).toString("hex"), 16) % 1_000_000_000_000_000;
  return num.toString().length === 15 ? num : createUID();
}
