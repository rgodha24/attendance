import { Button } from "@/components/ui/button";
// import { trpc } from "@/lib/trpc";
import { useSignins } from "@/lib/useSignins";
import { useWsConnection } from "@/lib/ws";

export const Home = () => {
  const signins = useSignins({
    scannerName: "test",
    start: new Date(2023, 8, 29),
    end: new Date(),
  });

  useWsConnection();

  return (
    <>
      {JSON.stringify(signins.data, null, 2)}
      <br />
      <Button onClick={() => signins.refetch()}>refetch</Button>
      {signins.data?.length}
    </>
  );
};
