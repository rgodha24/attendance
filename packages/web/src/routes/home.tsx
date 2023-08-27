import { trpc } from "@/lib/trpc";

export const Home = () => {
  const hello = trpc.hello.useQuery();

  if (hello.isLoading) return "Loading...";
  if (hello.isError) return hello.error.message;

  return (
    <>
      <div>hello: {hello.data}</div>
    </>
  );
};
