import { FC } from "react";
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
}> = ({ signedIn, now }) => (
  <div className="py-2">
    <h3 className="py-2 -mb-4 text-lg font-semibold text-center">
      Signed In Students ({signedIn.length})
    </h3>
    <Table>
      <TableHeader>
        <TableHead>Sortable Name</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Student ID</TableHead>
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
  </div>
);

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
