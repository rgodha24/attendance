import { useQuery } from "@tanstack/react-query";
import { getSignIns } from "./idb";

export const useSignins = ({
  scannerName,
  start,
  end,
}: {
  scannerName: string | undefined;
  start: Date;
  end: Date;
}) =>
  useQuery({
    queryKey: ["signins", scannerName, start, end] as const,
    queryFn: async ({ queryKey: [, scannerName, start, end] }) =>
      !!scannerName ? getSignIns({ scannerName, start, end }) : [],
  });
