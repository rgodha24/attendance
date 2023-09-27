import { FC, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { SignIn } from "@/lib/idb";
import { formatDistanceStrict } from "date-fns";
import { useAtom } from "jotai";
import { deduplicateAtom } from "@/lib/atoms";

export const NotSignedIn: FC<{
  notSignedIn: { studentID: number; name: string }[];
}> = ({ notSignedIn }) => (
  <div className="py-2">
    <h3 className="py-2 -mb-4 text-lg font-semibold text-center">
      Not Signed In Students ({notSignedIn.length})
    </h3>
    <Table>
      <TableHeader>
        <TableHead>Sortable Name</TableHead>
        <TableHead>Student ID</TableHead>
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
  </div>
);

export const SignedIn: FC<{
  signedIn: Array<SignIn & { name: string }>;
  now: Date;
}> = ({ signedIn, now }) => {
  const [deduplicated] = useAtom(deduplicateAtom);

  const data = useMemo(
    () => (deduplicated ? deduplicate(signedIn) : signedIn),
    [signedIn, deduplicated]
  );

  return (
    <div className="py-2">
      <h3 className="py-2 -mb-4 text-lg font-semibold text-center">
        Signed In Students ({data.length})
      </h3>
      <Table>
        <TableHeader>
          <TableHead>Sortable Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Student ID</TableHead>
        </TableHeader>
        <TableBody>
          {data.map((signin) => (
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
    </div>
  );
};

export const NotInClass: FC<{
  notInClass: { time: Date; id: string; studentID: number }[];
  now: Date;
}> = ({ now, notInClass }) => (
  <div className="py-2">
    <h3 className="py-2 -mb-4 text-lg font-semibold text-center">
      Signins not in this class ({notInClass.length})
    </h3>
    <Table>
      <TableHeader>
        <TableHead>Date</TableHead>
        <TableHead>Student ID</TableHead>
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
);

function deduplicate<T extends { studentID: number; time: Date }>(
  signins: T[]
): T[] {
  return signins
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .filter((signin, index, self) => {
      return self.findIndex((s) => s.studentID === signin.studentID) === index;
    });
}
