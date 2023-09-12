import { ClassSelect, ScannerSelect } from "@/components/selectors";
import { NotInClass, NotSignedIn, SignedIn } from "@/components/tables";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-picker";
import { datesStore } from "@/lib/dates";
import { SignIn, getAllScannerNames } from "@/lib/idb";
import { trpc } from "@/lib/trpc";
import { useGetServerSignins } from "@/lib/useGetServerSignins";
import { useSignins } from "@/lib/useSignins";
import { useWsConnection } from "@/lib/ws";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { RefreshCwIcon } from "lucide-react";
import { FC, useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import { selectedClassAtom, scannerNameAtom } from "@/lib/atoms";
import {
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
  TooltipContent,
} from "@/components/ui/tooltip";
import { formatDistanceStrict } from "date-fns";

export type Class = {
  name: string;
  students: { studentID: number; name: string }[];
  classID: string;
};

export const Home = () => {
  const { start, end, setStart, setEnd } = useStore(datesStore);

  const classes = trpc.class.getAll.useQuery(undefined, {
    refetchInterval: false,
  });
  const [selectedClass] = useAtom(selectedClassAtom);
  const [scannerName] = useAtom(scannerNameAtom);
  let [now, setNow] = useState(new Date());

  useWsConnection();
  const signins = useSignins({
    scannerName,
    start,
    end,
  });

  const serverSignIns = useGetServerSignins();

  const scanners = useQuery({
    queryKey: ["scanners"],
    queryFn: getAllScannerNames,
  });

  const { signedIn, notSignedIn, notInClass } = useMemo(() => {
    if (signins.data === undefined)
      return { signedIn: [], notSignedIn: [], notInClass: [] };
    else if (selectedClass === undefined)
      return { signedIn: [], notSignedIn: [], notInClass: signins.data };

    const idToName = new Map(
      selectedClass.students.map((student) => [student.studentID, student.name])
    );

    const signedIn: Array<SignIn & { name: string }> = [];
    const notInClass: Array<SignIn> = [];

    for (const s of signins.data) {
      const name = idToName.get(s.studentID);
      if (!name) notInClass.push(s);
      else signedIn.push({ ...s, name });
    }

    const signedInIDS = new Set(signins.data.map((s) => s.studentID));

    const notSignedIn = selectedClass.students.filter(
      ({ studentID }) => !signedInIDS.has(studentID)
    );

    console.log("here2");

    return { signedIn, notSignedIn, notInClass };
  }, [signins.data, selectedClass, scannerName]);

  useEffect(() => {
    const int = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(int);
  }, []);

  // might not be the best way of doing this, but this will refetch
  // from the backend every time we change the start/end date
  useEffect(() => {
    serverSignIns.refetch();
  }, [start, end]);

  if (classes.isLoading) return <div>Loading...</div>;
  else if (classes.error) return <div>Error: {classes.error.message}</div>;
  else if (!scanners.data) return <div>loading....</div>;

  return (
    <>
      <div className="flex flex-row gap-x-4 justify-between mx-4">
        <DateTimePicker date={start} setDate={setStart} />
        <ClassSelect classes={classes.data} />
        <ScannerSelect scanners={scanners.data} />
        <DateTimePicker date={end} setDate={setEnd} />
        <FetchFromServerButton
          onClick={() => serverSignIns.refetch()}
          isSubmitting={serverSignIns.isFetching}
          lastUpdated={serverSignIns.dataUpdatedAt}
          now={now}
        />
      </div>
      {/* TODO: grid to make it more responsive?? */}
      <div className="grid grid-cols-1 gap-x-4 mx-4 md:grid-cols-2 xl:grid-cols-3">
        <SignedIn {...{ now, signedIn }} />
        <NotSignedIn {...{ notSignedIn }} />
        <NotInClass {...{ now, notInClass }} />
      </div>
    </>
  );
};

const FetchFromServerButton: FC<{
  onClick: () => void;
  isSubmitting: boolean;
  lastUpdated: number;
  now: Date;
}> = ({ onClick, isSubmitting, lastUpdated, now }) => (
  <div className="justify-start min-w-4">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="outline"
            className="flex-1 rounded-full group"
            size="icon"
            onClick={onClick}
            disabled={isSubmitting}
          >
            <RefreshCwIcon
              className={"h-4 min-w-4" + (isSubmitting ? " animate-spin" : "")}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            fetch signins from server (last happened
            {" " +
              formatDistanceStrict(new Date(lastUpdated), now, {
                addSuffix: true,
              })}
            )
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);
