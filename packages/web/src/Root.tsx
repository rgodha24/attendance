import { useEffect, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./lib/trpc";
import { Outlet } from "@tanstack/react-router";
import { Navbar } from "./components/Navbar";
import { ThemeProvider } from "./lib/themeProvider";
import { Toaster } from "./components/ui/toaster";
import superjson from "superjson";

export const API = import.meta.env.VITE_API_URL;

export function Root() {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() => {
    const token = localStorage.getItem("token");
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: `${API}/trpc`,
          headers() {
            return token
              ? {
                Authorization: `Bearer ${JSON.parse(token)}`,
              }
              : {};
          },
        }),
      ],
      transformer: superjson,
    });
  });

  useEffect(() => {
    window.addEventListener("signin", () => {
      console.log("invalidating queries");
      queryClient.invalidateQueries(["signins"]);
    });
    window.addEventListener("scanner", () => {
      console.log("invalidating queries");
      queryClient.invalidateQueries(["scanners"]);
      queryClient.invalidateQueries([["scanner", "connected"]]);
    });
  }, [queryClient]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Navbar />
          <Outlet />
          <Toaster />
          {import.meta.env.DEV && <ReactQueryDevtools />}
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
