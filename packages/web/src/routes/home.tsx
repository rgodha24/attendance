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
import { ClockIcon, MergeIcon, RefreshCwIcon } from "lucide-react";
import { FC, useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import {
  selectedClassAtom,
  scannerNameAtom,
  deduplicateAtom,
} from "@/lib/atoms";
import {
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
  TooltipContent,
} from "@/components/ui/tooltip";
import { formatDistanceStrict, setHours, setMinutes } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { Toggle } from "@/components/ui/toggle";

export type Class = {
  name: string;
  students: { studentID: number; name: string }[];
  classID: string;
  period: string;
  semester: "fall" | "spring" | "other";
};

export const Home = () => {
  const { start, end, setStart, setEnd } = useStore(datesStore);

  const classes = trpc.class.getAll.useQuery(undefined, {
    refetchInterval: false,
  });
  const [selectedClass] = useAtom(selectedClassAtom);
  const [scannerName] = useAtom(scannerNameAtom);
  const [now, setNow] = useState(new Date());

  useWsConnection();
  const signins = useSignins();

  const serverSignIns = useGetServerSignins();

  const scanners = useQuery({
    queryKey: ["scanners"],
    queryFn: getAllScannerNames,
  });

  const { signedIn, notSignedIn, notInClass } = useMemo(() => {
    if (selectedClass === undefined)
      return { signedIn: [], notSignedIn: [], notInClass: signins };

    const idToName = new Map(
      selectedClass.students.map((student) => [student.studentID, student.name])
    );

    const signedIn: Array<SignIn & { name: string }> = [];
    const notInClass: Array<SignIn> = [];

    for (const s of signins) {
      const name = idToName.get(s.studentID);
      if (!name) notInClass.push(s);
      else signedIn.push({ ...s, name });
    }

    const signedInIDS = new Set(signins.map((s) => s.studentID));

    const notSignedIn = selectedClass.students.filter(
      ({ studentID }) => !signedInIDS.has(studentID)
    );

    return { signedIn, notSignedIn, notInClass };
  }, [signins, selectedClass, scannerName]);

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
        <ResetTimeButton />
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
        <DeduplicateButton />
      </div>
      <div className="grid grid-cols-1 gap-x-4 mx-4 md:grid-cols-2 xl:grid-cols-3">
        <SignedIn {...{ now, signedIn }} />
        <NotSignedIn {...{ notSignedIn }} />
        <NotInClass {...{ now, notInClass }} />
      </div>
    </>
  );
};

const DeduplicateButton: FC<{}> = () => {
  const [deduplicated, setDeduplicated] = useAtom(deduplicateAtom);

  return (
    <div className="min-w-fit">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger tabIndex={-1}>
            <Toggle
              variant="outline"
              className="rounded-full"
              pressed={deduplicated}
              onPressedChange={setDeduplicated}
              aria-label="deduplicate signed in students"
            >
              <MergeIcon className="w-4 h-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Deduplicate the "signed in students" table. Keeps the more recent
              signin. Currently {deduplicated ? "on" : "off"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const ResetTimeButton: FC<{}> = () => {
  const { setTimes } = useStore(datesStore, ({ setTimes }) => ({ setTimes }));

  return (
    <div className="min-w-fit">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 rounded-full group"
              size="icon"
              onClick={() => {
                setTimes(
                  setMinutes(new Date(), new Date().getMinutes() - 10),
                  setHours(new Date(), new Date().getHours() + 1)
                );
                toast({
                  title: "reset time successfully",
                });
              }}
              aria-label="reset time"
            >
              <ClockIcon className="h-4 min-w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              reset time to starting at 10 minutes ago and ending at 1 hour in
              the future
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const FetchFromServerButton: FC<{
  onClick: () => void;
  isSubmitting: boolean;
  lastUpdated: number;
  now: Date;
}> = ({ onClick, isSubmitting, lastUpdated, now }) => (
  <div className="justify-start min-w-fit">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 rounded-full group"
            size="icon"
            aria-label="refresh"
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
