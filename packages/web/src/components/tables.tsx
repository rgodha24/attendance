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
);

export const SignedIn: FC<{
  signedIn: Array<SignIn & { name: string }>;
  now: Date;
}> = ({ signedIn, now }) => (
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
);

export const NotInClass: FC<{
  notInClass: { time: Date; id: string; studentID: number }[];
  now: Date;
}> = ({ now, notInClass }) => (
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
);
