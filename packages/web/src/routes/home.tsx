import { DateTimePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { datesStore } from "@/lib/dates";
import { SignIn, getAllScannerNames } from "@/lib/idb";
import { trpc } from "@/lib/trpc";
import { useSignins } from "@/lib/useSignins";
import { useWsConnection } from "@/lib/ws";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceStrict } from "date-fns";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";

type Class = {
  name: string;
  students: { studentID: number; name: string }[];
};

export const selectedClassAtom = atomWithStorage<Class | undefined>(
  "selected-class",
  undefined
);

export const scannerNameAtom = atomWithStorage<string>("scannerName", "test");

export const Home = () => {
  const { start, end, setStart, setEnd } = useStore(datesStore);

  const classes = trpc.class.getAll.useQuery(undefined, {
    refetchInterval: false,
  });
  const [selectedClass, setSelectedClass] = useAtom(selectedClassAtom);
  const [scannerName, setScannerName] = useAtom(scannerNameAtom);
  let [now, setNow] = useState(new Date());

  useWsConnection();
  const signins = useSignins({
    scannerName,
    start,
    end,
  });

  const scanners = useQuery({
    queryKey: ["scanners"],
    queryFn: getAllScannerNames,
  });

  const { signedIn, notSignedIn, notInClass } = useMemo(() => {
    console.log("rerunning!!!");
    if (signins.data === undefined)
      return { signedIn: [], notSignedIn: [], notInClass: [] };
    else if (selectedClass === undefined)
      return { signedIn: [], notSignedIn: [], notInClass: signins.data };

    console.log("here");
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
  }, [signins.data?.length, selectedClass, scannerName]);

  useEffect(() => {
    const int = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(int);
  });

  if (classes.isLoading) return <div>Loading...</div>;
  else if (classes.error) return <div>Error: {classes.error.message}</div>;
  else if (!scanners.data) return <div>loading....</div>;

  return (
    <>
      <div className="flex flex-row gap-x-4 justify-between mx-4">
        <DateTimePicker date={start} setDate={setStart} />
        <Select
          onValueChange={(name) => {
            setSelectedClass(
              classes.data.find((class_) => class_.classID === name)
            );
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {selectedClass ? selectedClass.name : "Select a class"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Classes:</SelectLabel>
              {classes.data.map((class_) => (
                <SelectItem key={class_.classID} value={class_.classID}>
                  {class_.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(name) => {
            setScannerName(name);
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {scannerName ? scannerName : "Select a scanner"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Scanners:</SelectLabel>
              {scanners.data.map((scanner) => (
                <SelectItem key={scanner} value={scanner}>
                  {scanner}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <DateTimePicker date={end} setDate={setEnd} />
      </div>
      <div className="flex flex-row gap-x-4 mx-4">
        <Table>
          <TableHeader>
            <TableHead>name</TableHead>
            <TableHead>date</TableHead>
            <TableHead>studentid</TableHead>
          </TableHeader>
          <TableBody>
            {signedIn.map((signin) => (
              <TableRow key={signin.id}>
                <TableCell>{signin.name}</TableCell>
                <TableCell>
                  {formatDistanceStrict(signin.time, now, { addSuffix: true })}
                </TableCell>
                <TableCell>{signin.studentID}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Table>
          <TableHeader>
            <TableHead>name</TableHead>
            <TableHead>studentid</TableHead>
          </TableHeader>
          <TableBody>
            {notSignedIn.map((student) => (
              // key on studentID should be fine bc notSignedIn should have unique student IDs, while signedIn doesn't
              <TableRow key={student.studentID}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.studentID}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Table>
          <TableHeader>
            <TableHead>date</TableHead>
            <TableHead>studentid</TableHead>
          </TableHeader>
          <TableBody>
            {notInClass.map((signin) => (
              <TableRow key={signin.id}>
                <TableCell>
                  {formatDistanceStrict(signin.time, now, { addSuffix: true })}
                </TableCell>
                <TableCell>{signin.studentID}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
