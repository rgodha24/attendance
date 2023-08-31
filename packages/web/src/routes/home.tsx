import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSignins } from "@/lib/useSignins";
import { useWsConnection } from "@/lib/ws";

export const Home = () => {
  useWsConnection();
  const signins = useSignins({
    scannerName: "test",
    start: new Date(2023, 7, 31),
    end: new Date(2023, 8, 1),
  });

  return (
    <>
      <Table>
        <TableHeader>
          <TableHead>date</TableHead>
          <TableHead>studentid</TableHead>
        </TableHeader>
        <TableBody>
          {signins.data?.map((signin) => (
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
