import { customAlphabet } from "nanoid";

let nanoid = customAlphabet("0123456789", 15);

export function createUID() {
  let num: number;

  do {
    num = parseInt(nanoid());
  } while (num.toString().length !== 15);

  return num;
}
