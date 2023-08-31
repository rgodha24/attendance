import { useQuery } from "@tanstack/react-query";
import { getSignins } from "./duckdb";

export const useSignins = ({
  start,
  end,
  scannerName,
}: {
  start: Date;
  end: Date;
  scannerName: string;
}) =>
  useQuery({
    queryKey: ["signins", scannerName, start, end] as const,
    queryFn: async ({ queryKey: [_, scannerName, start, end] }) => {
      return getSignins({ start, end, scannerName });
    },
  });
