// import { getSignins } from "@/lib/duckdb";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
// import { useState } from "react";

export const Home = () => {
  const hello = trpc.hello.useQuery();
  const signins = trpc.signIn.get.useQuery({});

  if (hello.isLoading) return "Loading...";
  if (hello.isError) return hello.error.message;

  return (
    <>
      <div>hello: {hello.data}</div>

      {JSON.stringify(signins.data, null, 2)}
      <br />
      <Button onClick={() => signins.refetch()}>refetch</Button>
    </>
  );
};
