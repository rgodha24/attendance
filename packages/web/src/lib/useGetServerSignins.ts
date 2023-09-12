import { useQuery } from "@tanstack/react-query";
import { trpc } from "./trpc";
import { useStore } from "zustand";
import { datesStore } from "./dates";
import { addSignIn } from "./idb";

export const useGetServerSignins = () => {
  const utils = trpc.useContext();
  const { start, end } = useStore(datesStore);

  const q = useQuery({
    queryKey: ["serverSignins"],
    queryFn: async () => {
      const signins = await utils.signIn.get.fetch({ start, end });
      const last = signins.length - 1;
      await Promise.all(
        signins.map(({ signInID, ...s }, i) =>
          addSignIn({ ...s, id: signInID }, i === last).catch(() =>
            console.log("ignoring signin of studentid", s.studentID)
          )
        )
      );

      return signins;
    },
    refetchInterval: false,
    refetchOnMount: true,
    refetchOnWindowFocus: "always",
  });

  return q;
};
