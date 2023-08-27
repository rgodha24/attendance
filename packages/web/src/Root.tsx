import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { trpc } from "./lib/trpc";
import { Outlet } from "@tanstack/react-router";
import { Navbar } from "./components/Navbar";
import { ThemeProvider } from "./lib/themeProvider";
import { Toaster } from "./components/ui/toaster";

const API = import.meta.env.VITE_API_URL;

export function Root() {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() => {
    const token = localStorage.getItem("token");
    return trpc.createClient({
      links: [
        httpBatchLink({
          url: `${API}/trpc`,
          headers() {
            return !!token
              ? {
                Authorization: `Bearer ${JSON.parse(token)}`,
              }
              : {};
          },
        }),
      ],
    });
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Navbar />
          <Outlet />
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
