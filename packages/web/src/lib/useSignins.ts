import { SignIn, getSignIns } from "./idb";
import { useStore } from "zustand";
import { datesStore } from "./dates";
import { useAtom } from "jotai";
import { scannerNameAtom } from "./atoms";
import { useEffect, useState } from "react";
import { emitter } from "./events";

export const useSignins = () => {
  const { start, end } = useStore(datesStore);
  const [scannerName] = useAtom(scannerNameAtom);

  const [signIns, setSignIns] = useState<SignIn[]>([]);

  useEffect(() =>
    emitter.on("signin", async ({ scannerName: s, time }) => {
      if (
        scannerName !== undefined &&
        s !== scannerName &&
        time > start &&
        time < end
      ) {
        setSignIns(await getSignIns({ scannerName, start, end }));
      }
    })
    , [scannerName, start, end]);

  return signIns;
};
