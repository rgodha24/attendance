import { DateTimePicker } from "@/components/ui/date-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { datesStore } from "@/lib/dates";
import { useSignins } from "@/lib/useSignins";
import { useWsConnection } from "@/lib/ws";
import { useStore } from "zustand";

export const Home = () => {
  const { start, end, setStart, setEnd } = useStore(datesStore);

  useWsConnection();
  const signins = useSignins({
    scannerName: "test",
    start,
    end,
  });

  return (
    <>
      <DateTimePicker date={start} setDate={setStart} />
      <DateTimePicker date={end} setDate={setEnd} />
      <Table>
        <TableHeader>
          <TableHead>date</TableHead>
          <TableHead>studentid</TableHead>
        </TableHeader>
        <TableBody>
          {(signins.data || []).map((signin) => (
            <TableRow key={signin.id}>
              <TableCell>{signin.time.toTimeString()}</TableCell>
              <TableCell>{signin.studentID}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
